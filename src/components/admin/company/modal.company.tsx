import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProCard, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import 'styles/reset.scss';
import { isMobile } from 'react-device-detect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from "react";
import { callCreateCompany, callUpdateCompany, callUploadSingleFile } from "@/config/api";
import { ICompany } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ICompany | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface ICompanyForm {
    name: string;
    address: string;
}

interface ICompanyLogo {
    name: string;
    uid: string;
}

const ModalCompany = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    //modal animation
    const [animation, setAnimation] = useState<string>('open');

    const [loadingLogo, setLoadingLogo] = useState<boolean>(false);
    const [loadingImages, setLoadingImages] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<ICompanyLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [dataImages, setDataImages] = useState<ICompanyLogo[]>([]);
    const [dataMaps, setDataMaps] = useState<{ uid: string; value: string }[]>([]);

    const [value, setValue] = useState<string>("");
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?._id && dataInit?.description) {
            setValue(dataInit.description);
        }
        if (dataInit?._id && (dataInit as any)?.images?.length) {
            setDataImages((dataInit as any).images.map((img: string) => ({ name: img, uid: uuidv4() })));
        } else {
            setDataImages([]);
        }
        if (dataInit?._id && (dataInit as any)?.maps?.length) {
            setDataMaps((dataInit as any).maps.map((m: string) => ({ uid: uuidv4(), value: m })));
        } else {
            setDataMaps([]);
        }
    }, [dataInit])

    const submitCompany = async (valuesForm: ICompanyForm) => {
        const { name, address } = valuesForm;

        // Chỉ bắt buộc logo khi tạo mới
        if (!dataInit?._id && dataLogo.length === 0) {
            message.error('Vui lòng upload ảnh Logo')
            return;
        }

        if (dataInit?._id) {
            //update
            const imagesToSend = (dataImages.length ? dataImages.map(i => i.name) : ((dataInit as any)?.images ?? []));
            const mapsToSend = (dataMaps.length ? dataMaps.map(i => i.value) : ((dataInit as any)?.maps ?? []));
            const logoToSend = (dataLogo.length ? dataLogo[0].name : ((dataInit as any)?.logo ?? ""));
            const res = await callUpdateCompany(dataInit._id, name, address, value, logoToSend, imagesToSend, mapsToSend);
            if (res && res.data) {
                message.success("Cập nhật company thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const res = await callCreateCompany(name, address, value, dataLogo[0].name, dataImages.map(i => i.name), dataMaps.map(i => i.value));
            if (res && res.data) {
                message.success("Thêm mới company thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setValue("");
        setDataInit(null);
        setDataImages([]);
        setDataMaps([]);

        //add animation when closing modal
        setAnimation('close')
        await new Promise(r => setTimeout(r, 400))
        setOpenModal(false);
        setAnimation('open')
    }

    const handleRemoveFile = (file: any) => {
        setDataLogo([])
    }

    const handleRemoveImage = (file: any) => {
        setDataImages(prev => prev.filter(f => f.uid !== file.uid));
    }

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChangeLogo = (info: any) => {
        if (info?.file?.status === 'uploading') {
            setLoadingLogo(true);
        } else if (info?.file?.status === 'done' || info?.file?.status === 'removed') {
            setLoadingLogo(false);
        } else if (info?.file?.status === 'error') {
            setLoadingLogo(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
        }
    };

    const handleChangeImages = (info: any) => {
        if (info?.file?.status === 'uploading') {
            setLoadingImages(true);
        } else if (info?.file?.status === 'done' || info?.file?.status === 'removed') {
            setLoadingImages(false);
        } else if (info?.file?.status === 'error') {
            setLoadingImages(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res = await callUploadSingleFile(file, "company");
        if (res && res.data) {
            setDataLogo([{
                name: res.data.fileName,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataLogo([])
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };

    const handleUploadFileImages = async ({ file, onSuccess, onError }: any) => {
        const res = await callUploadSingleFile(file, "company");
        if (res && (res as any).data) {
            setDataImages(prev => ([...prev, { name: (res as any).data?.fileName, uid: uuidv4() }]));
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };


    return (
        <>
            {openModal &&
                <>
                    <ModalForm
                        title={<>{dataInit?._id ? "Cập nhật Company" : "Tạo mới Company"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => { handleReset() },
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-company ${animation}`,
                            rootClassName: `modal-company-root ${animation}`
                        }}
                        scrollToFirstError={true}
                        preserve={false}
                        form={form}
                        onFinish={submitCompany}
                        initialValues={dataInit?._id ? dataInit : {}}
                        submitter={{
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: {
                                icon: <CheckSquareOutlined />
                            },
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: <>{dataInit?._id ? "Cập nhật" : "Tạo mới"}</>,
                            }
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tên công ty"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tên công ty"
                                />
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh Logo"
                                    name="logo"
                                    rules={[
                                        {
                                            validator: () => {
                                                // Cho phép dùng logo hiện có khi update; chỉ yêu cầu khi tạo mới
                                                if (dataInit?._id) return Promise.resolve();
                                                if (dataLogo.length > 0) return Promise.resolve();
                                                return Promise.reject(new Error('Vui lòng upload ảnh Logo'));
                                            }
                                        }
                                    ]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadFileLogo}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChangeLogo}
                                            onRemove={(file) => handleRemoveFile(file)}
                                            onPreview={handlePreview}
                                            defaultFileList={
                                                dataInit?._id ?
                                                    [
                                                        {
                                                            uid: uuidv4(),
                                                            name: dataInit?.logo ?? "",
                                                            status: 'done',
                                                            url: `${import.meta.env.VITE_BACKEND_URL}/images/company/${dataInit?.logo}`,
                                                        }
                                                    ] : []
                                            }

                                        >
                                            <div>
                                                {loadingLogo ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Form.Item>

                            </Col>

                            <Col span={16}>
                                <ProFormTextArea
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập địa chỉ công ty"
                                    fieldProps={{
                                        autoSize: { minRows: 4 }
                                    }}
                                />
                            </Col>

                            <ProCard
                                title="Miêu tả"
                                // subTitle="mô tả công ty"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                                headerBordered
                                size="small"
                                bordered
                            >
                                <Col span={24}>
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
                                    />
                                </Col>
                            </ProCard>
                            <ProCard
                                title="Hình ảnh công ty"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                                headerBordered
                                size="small"
                                bordered
                            >
                                <Col span={24}>
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="images"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            multiple
                                            customRequest={handleUploadFileImages}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChangeImages}
                                            onRemove={(file) => handleRemoveImage(file)}
                                            fileList={dataImages.map(i => ({
                                                uid: i.uid,
                                                name: i.name,
                                                status: 'done',
                                                url: `${import.meta.env.VITE_BACKEND_URL}/images/company/${i.name}`,
                                            }))}
                                        >
                                            <div>
                                                {loadingImages ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Col>
                            </ProCard>
                            <ProCard
                                title="Bản đồ (iframe)"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                                headerBordered
                                size="small"
                                bordered
                            >
                                <Col span={24}>
                                    <Row gutter={[8, 8]}>
                                        {dataMaps.map((m, idx) => (
                                            <Col span={24} key={m.uid}>
                                                <Form.Item labelCol={{ span: 24 }} label={`Iframe #${idx + 1}`}>
                                                    <ProFormTextArea
                                                        name={`map_${m.uid}`}
                                                        placeholder="Dán mã iframe Google Maps tại đây"
                                                        fieldProps={{
                                                            value: m.value,
                                                            onChange: (e: any) => {
                                                                const val = e?.target?.value ?? '';
                                                                setDataMaps(prev => prev.map(x => x.uid === m.uid ? { ...x, value: val } : x));
                                                            },
                                                            autoSize: { minRows: 3, maxRows: 8 }
                                                        }}
                                                    />
                                                    <a onClick={() => setDataMaps(prev => prev.filter(x => x.uid !== m.uid))}>Xóa</a>
                                                </Form.Item>
                                            </Col>
                                        ))}
                                        <Col span={24}>
                                            <a onClick={() => setDataMaps(prev => ([...prev, { uid: uuidv4(), value: '' }]))}><PlusOutlined /> Thêm iframe</a>
                                        </Col>
                                    </Row>
                                </Col>
                            </ProCard>
                        </Row>
                    </ModalForm>
                    <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={() => setPreviewOpen(false)}
                        style={{ zIndex: 1500 }}
                    >
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </>
            }
        </>
    )
}

export default ModalCompany;
