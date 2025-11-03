import { Button, Col, Form, Row, Select } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface IProps {
    initialSkills?: string[];
    initialLocations?: string[];
}

const SearchClient = (props: IProps) => {
    const optionsSkills = SKILLS_LIST;
    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const navigate = useNavigate();


    const onFinish = async (values: any) => {
        const skills = values?.skills?.length ? values.skills.join(',') : '';
        const location = values?.location?.length ? values.location.join(',') : '';
        const params = new URLSearchParams();
        if (skills) params.set('skills', skills);
        if (location) params.set('location', location);
        navigate(`/job/search?${params.toString()}`);
    }

    // prefill từ props nếu có
    useEffect(() => {
        const initVals: any = {};
        if (props.initialSkills && props.initialSkills.length) initVals.skills = props.initialSkills;
        if (props.initialLocations && props.initialLocations.length) initVals.location = props.initialLocations;
        if (Object.keys(initVals).length) form.setFieldsValue(initVals);
    }, [props.initialSkills?.join(','), props.initialLocations?.join(',')]);

    return (
        <ProForm
            form={form}
            onFinish={onFinish}
            submitter={
                {
                    render: () => <></>
                }
            }
        >
            <Row gutter={[20, 20]}>
                <Col span={24}><h2>Việc Làm IT Cho Developer "Chất"</h2></Col>
                <Col span={24} md={16}>
                    <ProForm.Item
                        name="skills"
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            showArrow={false}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <MonitorOutlined /> Tìm theo kỹ năng...
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsSkills}
                        />
                    </ProForm.Item>
                </Col>
                <Col span={12} md={4}>
                    <ProForm.Item name="location">
                        <Select
                            mode="multiple"
                            allowClear
                            showArrow={false}
                            style={{ width: '100%' }}
                            placeholder={
                                <>
                                    <EnvironmentOutlined /> Địa điểm...
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsLocations}
                        />
                    </ProForm.Item>
                </Col>
                <Col span={12} md={4}>
                    <Button type='primary' onClick={() => form.submit()}>Search</Button>
                </Col>
            </Row>
        </ProForm>
    )
}
export default SearchClient;