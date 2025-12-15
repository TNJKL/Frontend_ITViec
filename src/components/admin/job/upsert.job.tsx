import { Alert, Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { JOB_TAG_DEFINITIONS, JOB_TAG_OPTIONS, LOCATION_LIST, SKILLS_LIST } from "@/config/utils";
import { ICompanySelect } from "../user/modal.user";
import { useState, useEffect } from 'react';
import { callCreateJob, callFetchCompany, callFetchJobById, callGetActiveUserPackages, callUpdateJob } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import dayjs from 'dayjs';
import { IJob, IServicePackage } from "@/types/backend";

const ViewUpsertJob = (props: any) => {
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);

    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id
    const [dataUpdate, setDataUpdate] = useState<IJob | null>(null);
    const [form] = Form.useForm();
    const [tagOptions, setTagOptions] = useState(JOB_TAG_OPTIONS);
    const [tagGuideline, setTagGuideline] = useState<string>('Đang kiểm tra các gói hỗ trợ tag...');
    const [packageOptions, setPackageOptions] = useState<Array<{
        value: string;
        label: string;
        supportedTags: string[];
        remainingJobs: number;
        priority: number;
        packageName?: string;
    }>>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const init = async () => {
            if (id) {
                const res = await callFetchJobById(id);
                if (res && res.data) {
                    setDataUpdate(res.data);
                    setValue(res.data.description);
                    setCompanies([
                        {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?._id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?._id
                        }
                    ])

                    form.setFieldsValue({
                        ...res.data,
                        company: {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?._id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?._id
                        },
                        userPackageId: res.data.userPackageId
                    })
                    if (res.data.userPackageId) {
                        setSelectedPackageId(res.data.userPackageId);
                    }
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id])

    useEffect(() => {
        fetchTagAvailability();
    }, []);

    useEffect(() => {
        if (!packageOptions.length) {
            setSelectedPackageId(undefined);
            setTagOptions(
                JOB_TAG_DEFINITIONS.map((def) => ({
                    label: def.label,
                    value: def.value,
                    disabled: def.value !== 'New',
                }))
            );
            setTagGuideline('Bạn chưa có gói đăng tin hoạt động. Vui lòng mua gói để sử dụng tag nâng cao.');
            return;
        }

        const preferredId = selectedPackageId || form.getFieldValue('userPackageId');
        const preferredOption =
            (preferredId && packageOptions.find((pkg) => pkg.value === preferredId)) || packageOptions[0];

        if (preferredOption) {
            setSelectedPackageId(preferredOption.value);
            form.setFieldsValue({ userPackageId: preferredOption.value });
            applyTagRuleForPackage(preferredOption);
        }
    }, [packageOptions]);

    // Usage of DebounceSelect
    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchCompany(`current=1&pageSize=100&name=/${name}/i`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: `${item._id}@#$${item.logo}` as string
                }
            })
            return temp;
        } else return [];
    }

    const fetchTagAvailability = async () => {
        try {
            const res = await callGetActiveUserPackages();
            const overview = res?.data;
            const activePackages = overview?.active || [];
            const packageOpts: typeof packageOptions = [];

            activePackages.forEach((pkg) => {
                const serviceInfo = (pkg.packageId as IServicePackage) || null;
                const stats = pkg.stats;
                const supportedTags =
                    (stats?.supportedTags?.length ? stats.supportedTags : serviceInfo?.supportedTags) || ['New'];
                const remainingJobs =
                    stats?.remainingJobs ?? Math.max((serviceInfo?.maxJobs || 0) - (pkg.usedJobs || 0), 0);

                if (serviceInfo?._id && pkg._id) {
                    packageOpts.push({
                        value: pkg._id,
                        label: `${serviceInfo.name} • Ưu tiên #${pkg.priority} • Còn ${remainingJobs} lượt`,
                        supportedTags,
                        remainingJobs,
                        priority: pkg.priority,
                        packageName: serviceInfo.name,
                    });
                }
            });

            setPackageOptions(packageOpts);
        } catch (error) {
            console.error('Error fetching tag availability', error);
            setTagGuideline('Không thể tải thông tin tag. Hãy thử tải lại trang nếu cần.');
        }
    };

    const applyTagRuleForPackage = (pkg?: typeof packageOptions[number]) => {
        if (!pkg) return;
        const supported = pkg.supportedTags?.length ? pkg.supportedTags : ['New'];
        const hasSlots = (pkg.remainingJobs ?? 0) > 0;
        const isEditing = Boolean(dataUpdate?._id);
        const currentTagValue = dataUpdate?.tag;
        setTagOptions(
            JOB_TAG_DEFINITIONS.map((def) => {
                const isCurrentTag = isEditing && currentTagValue === def.value;
                const shouldDisable =
                    !supported.includes(def.value) ||
                    (!isCurrentTag && !hasSlots);
                return {
                    label: def.label,
                    value: def.value,
                    disabled: shouldDisable,
                };
            })
        );
        setTagGuideline(
            `Gói ${pkg.packageName || ''} (ưu tiên #${pkg.priority}) hỗ trợ: ${supported.join(', ')} • Lượt còn lại: ${pkg.remainingJobs}`
        );
    };

    const handlePackageChange = (value: string) => {
        setSelectedPackageId(value);
        form.setFieldsValue({ userPackageId: value });
        const target = packageOptions.find((pkg) => pkg.value === value);
        if (target) {
            applyTagRuleForPackage(target);
            const currentTag = form.getFieldValue('tag');
            if (currentTag && !target.supportedTags.includes(currentTag)) {
                form.setFieldsValue({ tag: undefined });
            }
        }
    };

    const onFinish = async (values: any) => {
        const { userPackageId: selectedPackageFromForm, ...jobValues } = values;
        const packageIdToUse = selectedPackageFromForm || selectedPackageId;
        if (dataUpdate?._id) {
            //update
            const cp = jobValues?.company?.value?.split('@#$');
            const job = {
                name: jobValues.name,
                skills: jobValues.skills,
                company: {
                    _id: cp && cp.length > 0 ? cp[0] : "",
                    name: jobValues.company.label,
                    logo: cp && cp.length > 1 ? cp[1] : ""
                },
                location: jobValues.location,
                workingModel: jobValues.workingModel,
                salary: jobValues.salary,
                level: jobValues.level,
                description: value,
                startDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(jobValues.startDate) ? dayjs(jobValues.startDate, 'DD/MM/YYYY').toDate() : jobValues.startDate,
                endDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(jobValues.endDate) ? dayjs(jobValues.endDate, 'DD/MM/YYYY').toDate() : jobValues.endDate,
                isActive: jobValues.isActive,
                tag: jobValues.tag,
                userPackageId: packageIdToUse
            }

            const res = await callUpdateJob(job, dataUpdate._id);
            if (res.data) {
                message.success("Cập nhật job thành công");
                navigate('/admin/job')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const cp = jobValues?.company?.value?.split('@#$');
            const job = {
                name: jobValues.name,
                skills: jobValues.skills,
                company: {
                    _id: cp && cp.length > 0 ? cp[0] : "",
                    name: jobValues.company.label,
                    logo: cp && cp.length > 1 ? cp[1] : ""
                },
                location: jobValues.location,
                workingModel: jobValues.workingModel,
                salary: jobValues.salary,
                level: jobValues.level,
                description: value,
                startDate: dayjs(jobValues.startDate, 'DD/MM/YYYY').toDate(),
                endDate: dayjs(jobValues.endDate, 'DD/MM/YYYY').toDate(),
                isActive: jobValues.isActive,
                tag: jobValues.tag,
                userPackageId: packageIdToUse
            }

            const res = await callCreateJob(job);
            if (res.data) {
                message.success("Tạo mới job thành công");
                navigate('/admin/job')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }



    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/admin/job">Manage Job</Link>,
                        },
                        {
                            title: 'Upsert Job',
                        },
                    ]}
                />
            </div>
            <div >

                <ConfigProvider locale={enUS}>
                    <ProForm
                        form={form}
                        onFinish={onFinish}
                        submitter={
                            {
                                searchConfig: {
                                    resetText: "Hủy",
                                    submitText: <>{dataUpdate?._id ? "Cập nhật Job" : "Tạo mới Job"}</>
                                },
                                onReset: () => navigate('/admin/job'),
                                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                                submitButtonProps: {
                                    icon: <CheckSquareOutlined />
                                },
                            }
                        }
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProFormText
                                    label="Tên Job"
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng không bỏ trống' },
                                    ]}
                                    placeholder="Nhập tên job"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="skills"
                                    label="Kỹ năng yêu cầu"
                                    options={SKILLS_LIST}
                                    placeholder="Please select a skill"
                                    rules={[{ required: true, message: 'Vui lòng chọn kỹ năng!' }]}
                                    allowClear
                                    mode="multiple"
                                    fieldProps={{
                                        showArrow: false
                                    }}

                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="location"
                                    label="Địa điểm"
                                    options={LOCATION_LIST.filter(item => item.value !== 'ALL')}
                                    placeholder="Please select a location"
                                    rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="workingModel"
                                    label="Working Model"
                                    valueEnum={{
                                        AT_OFFICE: 'At office',
                                        REMOTE: 'Remote',
                                        HYBRID: 'Hybrid',
                                    }}
                                    placeholder="Please select working model"
                                    rules={[{ required: true, message: 'Vui lòng chọn Working Model!' }]}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Mức lương"
                                    name="salary"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập mức lương"
                                    fieldProps={{
                                        addonAfter: " đ",
                                        formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                        parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="level"
                                    label="Trình độ"
                                    valueEnum={{
                                        INTERN: 'INTERN',
                                        FRESHER: 'FRESHER',
                                        JUNIOR: 'JUNIOR',
                                        MIDDLE: 'MIDDLE',
                                        SENIOR: 'SENIOR',
                                    }}
                                    placeholder="Please select a level"
                                    rules={[{ required: true, message: 'Vui lòng chọn level!' }]}
                                />
                            </Col>

                            {(dataUpdate?._id || !id) &&
                                <Col span={24} md={6}>
                                    <ProForm.Item
                                        name="company"
                                        label="Thuộc Công Ty"
                                        rules={[{ required: true, message: 'Vui lòng chọn company!' }]}
                                    >
                                        <DebounceSelect
                                            allowClear
                                            showSearch
                                            defaultValue={companies}
                                            value={companies}
                                            placeholder="Chọn công ty"
                                            fetchOptions={fetchCompanyList}
                                            onChange={(newValue: any) => {
                                                if (newValue?.length === 0 || newValue?.length === 1) {
                                                    setCompanies(newValue as ICompanySelect[]);
                                                }
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    </ProForm.Item>

                                </Col>
                            }

                        </Row>
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày bắt đầu"
                                    name="startDate"
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày kết thúc"
                                    name="endDate"
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    // width="auto"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSwitch
                                    label="Trạng thái"
                                    name="isActive"
                                    checkedChildren="ACTIVE"
                                    unCheckedChildren="INACTIVE"
                                    initialValue={true}
                                    fieldProps={{
                                        defaultChecked: true,
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="userPackageId"
                                    label="Chọn gói sử dụng"
                                    options={packageOptions}
                                    placeholder="Chọn gói sẽ bị trừ lượt"
                                    fieldProps={{
                                        onChange: (value: string) => handlePackageChange(value),
                                    }}
                                    rules={packageOptions.length ? [{ required: true, message: 'Vui lòng chọn gói để trừ lượt' }] : []}
                                    allowClear={false}
                                    disabled={!packageOptions.length}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="tag"
                                    label="Tag"
                                    options={tagOptions}
                                    placeholder="Chọn tag (tùy chọn)"
                                    allowClear
                                />
                                {tagGuideline && (
                                    <Alert
                                        type="info"
                                        showIcon
                                        message="Quyền sử dụng tag"
                                        description={tagGuideline}
                                        style={{ marginTop: 8 }}
                                    />
                                )}
                            </Col>
                            <Col span={24}>
                                <ProForm.Item
                                    name="description"
                                    label="Miêu tả job"
                                    rules={[{ required: true, message: 'Vui lòng nhập miêu tả job!' }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
                                    />
                                </ProForm.Item>
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>

            </div>
        </div>
    )
}

export default ViewUpsertJob;