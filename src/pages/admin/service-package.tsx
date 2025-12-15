import ModalServicePackage from "@/components/admin/service-package/modal.service-package";
import DataTable from "@/components/client/data-table";
import { IServicePackage } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteServicePackage, callFetchServicePackages } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const ServicePackagePage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IServicePackage | null>(null);
    const [dataSource, setDataSource] = useState<IServicePackage[]>([]);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        pages: 0,
    });
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const tableRef = useRef<ActionType>();

    const handleDeleteServicePackage = async (_id: string | undefined) => {
        if (_id) {
            const res = await callDeleteServicePackage(_id);
            if (res && res.data) {
                message.success('Xóa gói dịch vụ thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IServicePackage>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.current - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Id',
            dataIndex: '_id',
            width: 250,
            render: (text, record, index, action) => {
                return (
                    <span>
                        {record._id}
                    </span>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Tên gói',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Giá (VND)',
            dataIndex: 'price',
            sorter: true,
            render: (text, record) => {
                return (
                    <span>
                        {new Intl.NumberFormat('vi-VN').format(record.price)} đ
                    </span>
                )
            },
        },
        {
            title: 'Số job tối đa',
            dataIndex: 'maxJobs',
            sorter: true,
            align: 'center',
        },
        {
            title: 'Thời hạn (ngày)',
            dataIndex: 'durationDays',
            sorter: true,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            align: 'center',
            render: (text, record) => {
                return (
                    <Tag color={record.isActive ? 'green' : 'red'}>
                        {record.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Tag>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Actions',
            hideInSearch: true,
            width: 150,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setDataInit(entity);
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa gói dịch vụ"}
                        description={"Bạn có chắc chắn muốn xóa gói dịch vụ này ?"}
                        onConfirm={() => handleDeleteServicePackage(entity._id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.name) clone.name = `/${clone.name}/i`;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name" : "sort=-name";
        }
        if (sort && sort.price) {
            sortBy = sort.price === 'ascend' ? "sort=price" : "sort=-price";
        }
        if (sort && sort.maxJobs) {
            sortBy = sort.maxJobs === 'ascend' ? "sort=maxJobs" : "sort=-maxJobs";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt" : "sort=-createdAt";
        }

        //mặc định sort theo createdAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=-createdAt`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.COMPANIES.GET_PAGINATE}
            >
                <DataTable<IServicePackage>
                    actionRef={tableRef}
                    headerTitle="Danh sách Gói Dịch Vụ"
                    rowKey="_id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={dataSource}
                    request={async (params, sort, filter): Promise<any> => {
                        setIsFetching(true);
                        const query = buildQuery(params, sort, filter);
                        try {
                            const res = await callFetchServicePackages(query);
                            if (res && res.data) {
                                setDataSource(res.data.result || []);
                                setMeta({
                                    current: res.data.meta.current,
                                    pageSize: res.data.meta.pageSize,
                                    total: res.data.meta.total,
                                    pages: res.data.meta.pages,
                                });
                            }
                        } catch (error) {
                            notification.error({
                                message: 'Có lỗi xảy ra',
                                description: 'Không thể tải danh sách gói dịch vụ'
                            });
                        } finally {
                            setIsFetching(false);
                        }
                        return {
                            data: dataSource,
                            success: true,
                            total: meta.total,
                        };
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.current,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => {
                                    setDataInit(null);
                                    setOpenModal(true);
                                }}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                />
            </Access>
            <ModalServicePackage
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />
        </div>
    )
}

export default ServicePackagePage;

