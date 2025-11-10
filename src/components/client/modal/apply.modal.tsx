import { useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { Alert, Button, Col, ConfigProvider, Divider, Modal, Row, Upload, message, notification } from "antd";
import { useNavigate } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { callCheckResumeApplied, callCreateResume, callUploadSingleFile } from "@/config/api";
import { useEffect, useState } from 'react';
import dayjs from "dayjs";
import { IResumeCheck } from "@/types/backend";

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    jobDetail: IJob | null;
}

const ApplyModal = (props: IProps) => {
    const { isModalOpen, setIsModalOpen, jobDetail } = props;
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [urlCV, setUrlCV] = useState<string>("");
    const [applicationInfo, setApplicationInfo] = useState<IResumeCheck | null>(null);
    const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const navigate = useNavigate();

    const hasApplied = applicationInfo?.applied;
    const appliedAtText = applicationInfo?.appliedAt ? dayjs(applicationInfo.appliedAt).format("DD/MM/YYYY HH:mm") : "";

    useEffect(() => {
        if (!isModalOpen) {
            setApplicationInfo(null);
            setUrlCV("");
            return;
        }

        if (!isAuthenticated || !jobDetail?._id) {
            setApplicationInfo(null);
            return;
        }

        const fetchStatus = async () => {
            setCheckingStatus(true);
            try {
                const res = await callCheckResumeApplied(jobDetail._id!);
                const info = (res as any)?.data ?? res;
                setApplicationInfo(info ?? null);
            } catch (error) {
                setApplicationInfo(null);
            } finally {
                setCheckingStatus(false);
            }
        };

        fetchStatus();
    }, [isModalOpen, isAuthenticated, jobDetail?._id]);

    const handleNavigateManage = () => {
        setIsModalOpen(false);
        navigate('/account/manage');
    };

    const handleOkButton = async () => {
        if (submitting) return;

        if (!isAuthenticated) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`)
            return;
        }

        // Đợi check status xong nếu đang check
        if (checkingStatus) {
            message.info("Đang kiểm tra trạng thái ứng tuyển...");
            return;
        }

        // Kiểm tra nếu đã apply rồi
        if (hasApplied) {
            message.info(`Bạn đã ứng tuyển công việc này ngày ${appliedAtText}. Vui lòng chờ phản hồi hoặc cập nhật CV.`);
            if (applicationInfo?.resumeId) {
                handleNavigateManage();
            } else {
                setIsModalOpen(false);
            }
            return;
        }

        // Kiểm tra nếu chưa upload CV
        if (!urlCV) {
            message.error("Vui lòng upload CV!");
            return;
        }

        // Gọi API tạo resume
        if (jobDetail) {
            try {
                setSubmitting(true);
                const res = await callCreateResume(urlCV, jobDetail?.company?._id, jobDetail?._id);
                if (res.data) {
                    message.success("Rải CV thành công!");
                    setIsModalOpen(false);
                    // Refresh lại trạng thái
                    setApplicationInfo(null);
                    setUrlCV("");
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                }
            } catch (error: any) {
                // Xử lý lỗi từ backend khi đã apply rồi
                // Axios interceptor đã unwrap error, nên error đã là response.data
                const errorMessage = error?.message || 'Có lỗi xảy ra';
                const errorCode = error?.code;
                
                if (errorCode === 'ALREADY_APPLIED' || errorMessage.includes('đã ứng tuyển')) {
                    message.warning(errorMessage);
                    // Refresh lại trạng thái để hiển thị đúng
                    try {
                        const res = await callCheckResumeApplied(jobDetail._id!);
                        const info = (res as any)?.data ?? res;
                        setApplicationInfo(info ?? null);
                    } catch (e) {
                        // Ignore error khi check lại
                    }
                    if (error?.data?.resumeId) {
                        handleNavigateManage();
                    } else {
                        setIsModalOpen(false);
                    }
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: errorMessage
                    });
                }
            } finally {
                setSubmitting(false);
            }
        }
    }

    const propsUpload: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword, .doc, .docx, .pdf",
        async customRequest({ file, onSuccess, onError }: any) {
            const res = await callUploadSingleFile(file, "resume");
            if (res && res.data) {
                setUrlCV(res.data.fileName);
                if (onSuccess) onSuccess('ok')
            } else {
                if (onError) {
                    setUrlCV("");
                    const error = new Error(res.message);
                    onError({ event: error });
                }
            }
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
            }
        },
    };


    return (
        <>
            <Modal title="Ứng Tuyển Job"
                open={isModalOpen}
                onOk={() => handleOkButton()}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                okText={!isAuthenticated ? "Đăng Nhập Nhanh" : hasApplied ? "Đóng" : "Rải CV Nào"}
                okButtonProps={{ loading: submitting, disabled: checkingStatus }}
                cancelButtonProps={
                    { style: { display: "none" } }
                }
                destroyOnClose={true}
            >
                <Divider />
                {isAuthenticated ?
                    <div>
                        <ConfigProvider locale={enUS}>
                            <ProForm
                                submitter={{
                                    render: () => <></>
                                }}
                            >
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <div>
                                            Bạn đang ứng tuyển công việc <b>{jobDetail?.name} </b>tại  <b>{jobDetail?.company?.name}</b>
                                        </div>
                                    </Col>
                                    {hasApplied && (
                                        <Col span={24}>
                                            <Alert
                                                type="info"
                                                showIcon
                                                message={`Bạn đã ứng tuyển công việc này ngày ${appliedAtText}. Vui lòng chờ phản hồi hoặc cập nhật CV.`}
                                                description="Nhấn vào nút bên dưới để cập nhật lại CV đã gửi."
                                                action={
                                                    <Button type="link" onClick={handleNavigateManage}>
                                                        Cập nhật CV
                                                    </Button>
                                                }
                                            />
                                        </Col>
                                    )}
                                    <Col span={24}>
                                        <ProFormText
                                            fieldProps={{
                                                type: "email"
                                            }}
                                            label="Email"
                                            name={"email"}
                                            labelAlign="right"
                                            disabled
                                            initialValue={user?.email}
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <ProForm.Item
                                            label={"Upload file CV"}
                                            rules={[{ required: !hasApplied, message: 'Vui lòng upload file!' }]}
                                        >

                                            <Upload {...propsUpload} disabled={hasApplied}>
                                                <Button icon={<UploadOutlined />}>Tải lên CV của bạn ( Hỗ trợ *.doc, *.docx, *.pdf, and &lt; 5MB )</Button>
                                            </Upload>
                                        </ProForm.Item>
                                    </Col>
                                </Row>

                            </ProForm>
                        </ConfigProvider>
                    </div>
                    :
                    <div>
                        Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể "Rải CV" bạn nhé -.-
                    </div>
                }
                <Divider />
            </Modal>
        </>
    )
}
export default ApplyModal;
