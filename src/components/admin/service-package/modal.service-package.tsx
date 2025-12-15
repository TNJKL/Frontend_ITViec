import { CheckSquareOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import { Form, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import { useEffect } from "react";
import { callCreateServicePackage, callUpdateServicePackage } from "@/config/api";
import { IServicePackage } from "@/types/backend";
import { JOB_TAG_OPTIONS } from "@/config/utils";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IServicePackage | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalServicePackage = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?._id) {
            form.setFieldsValue({
                name: dataInit.name,
                price: dataInit.price,
                maxJobs: dataInit.maxJobs,
                durationDays: dataInit.durationDays,
                isActive: dataInit.isActive,
                supportedTags: dataInit.supportedTags ?? ['New'],
            });
        } else {
            form.resetFields();
        }
    }, [dataInit, form]);

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    };

    const submitServicePackage = async (values: any) => {
        const { name, price, maxJobs, durationDays, isActive, supportedTags } = values;

        if (dataInit?._id) {
            //update
            const res = await callUpdateServicePackage(
                {
                    name,
                    price,
                    maxJobs,
                    durationDays,
                    isActive: isActive !== undefined ? isActive : true,
                    supportedTags,
                },
                dataInit._id
            );
            if (res && res.data) {
                message.success("Cập nhật gói dịch vụ thành công");
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
            const res = await callCreateServicePackage({
                name,
                price,
                maxJobs,
                durationDays,
                isActive: isActive !== undefined ? isActive : true,
                supportedTags,
            });
            if (res && res.data) {
                message.success("Tạo mới gói dịch vụ thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    };

    return (
        <>
            <ModalForm
                title={dataInit?._id ? "Cập nhật Gói Dịch Vụ" : "Tạo mới Gói Dịch Vụ"}
                open={openModal}
                modalProps={{
                    onCancel: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? '100%' : 900,
                }}
                form={form}
                onFinish={submitServicePackage}
                submitter={{
                    render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                    submitButtonProps: {
                        icon: <CheckSquareOutlined />
                    },
                    searchConfig: {
                        resetText: "Hủy",
                        submitText: dataInit?._id ? "Cập nhật" : "Tạo mới",
                    },
                }}
            >
                <ProFormText
                    label="Tên gói"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                    placeholder="Nhập tên gói (ví dụ: Basic, Pro, Premium)"
                    width="md"
                />
                <ProFormDigit
                    label="Giá (VND)"
                    name="price"
                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                    placeholder="Nhập giá"
                    fieldProps={{
                        addonAfter: " đ",
                        formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                        parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, ''),
                        min: 0,
                    }}
                    width="md"
                />
                <ProFormDigit
                    label="Số lượng job tối đa"
                    name="maxJobs"
                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                    placeholder="Nhập số lượng job tối đa"
                    fieldProps={{
                        min: 1,
                    }}
                    width="md"
                />
                <ProFormDigit
                    label="Thời hạn (ngày)"
                    name="durationDays"
                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                    placeholder="Nhập thời hạn"
                    fieldProps={{
                        min: 1,
                    }}
                    width="md"
                />
                <ProFormSwitch
                    label="Trạng thái hoạt động"
                    name="isActive"
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Không hoạt động"
                    initialValue={true}
                />
                <ProFormSelect
                    label="Tag hỗ trợ"
                    name="supportedTags"
                    mode="multiple"
                    options={JOB_TAG_OPTIONS}
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 tag hỗ trợ' }]}
                    placeholder="Chọn các tag mà gói hỗ trợ"
                    initialValue={['New']}
                />
            </ModalForm>
        </>
    );
};

export default ModalServicePackage;

