/* eslint-disable no-unused-vars */
import React, { useMemo } from "react";
import { Table } from "antd";
import "./index.scss";

const Ctable = ({
  rowData,
  columnDefs,
  rowClassName,
  className,
  onRow,
  pageSize = 14,
  components,
  rowKey,
  onRowDoubleClick,
  showSTT = false,
  loading = false,
  showTotal = true,
  scrollY,
  locale,
  rowSelection,
  enableFilter = true,
  ...restProps
}) => {
  const rowHeight = 56;
  const tableScroll = {
    y: scrollY || pageSize * rowHeight,
    x: "max-content",
  };

  const columns = useMemo(() => {
    return columnDefs.map((col) => {
      const columnConfig = {
        title: col.headerName,
        dataIndex: col.field,
        key: col.field,
        align: col.align || "left",
        width: col.width,
        fixed: col.fixed,
        render: col.cellRenderer
          ? (value, record) => col.cellRenderer({ value, data: record })
          : undefined,
        filterIcon: col.filterIcon,
      };

      if (enableFilter && col.filter) {
        if (col.filters && col.onFilter) {
          columnConfig.filters = col.filters;
          columnConfig.onFilter = col.onFilter;
        } else if (col.filter === "agTextColumnFilter" || col.filter === true) {
          const uniqueValues = Array.from(
            new Set(rowData?.map((row) => row[col.field]).filter(Boolean))
          ).map((value) => ({
            text: value,
            value,
          }));

          columnConfig.filters = uniqueValues;
          columnConfig.onFilter = (value, record) =>
            record[col.field]?.toString().includes(value);
        }
      }

      return columnConfig;
    });
  }, [columnDefs, rowData, enableFilter]);

  const columnsWithSTT = useMemo(() => {
    if (!showSTT) return columns;
    return [
      {
        title: "STT",
        dataIndex: "__stt",
        key: "__stt",
        width: 70,
        align: "center",
        render: (_, __, index) => index + 1,
        fixed: columns[0]?.fixed === "left" ? "left" : undefined,
        filterable: false,
      },
      ...columns,
    ];
  }, [columns, showSTT]);

  return (
    <div className="tableHT">
      <Table
        className={`ctable-custom ${className || ""}`}
        columns={columnsWithSTT}
        dataSource={rowData}
        rowClassName={rowClassName}
        onRow={(record) => ({
          onDoubleClick: () => onRowDoubleClick?.(record),
          ...(onRow ? onRow(record) : {}),
        })}
        scroll={tableScroll}
        components={components}
        rowKey={rowKey}
        pagination={false}
        loading={loading}
        locale={{
          emptyText: (
            <span style={{ fontSize: 16, color: "#666" }}>
              {locale?.emptyText || "Không có dữ liệu"}
            </span>
          ),
          ...locale,
        }}
        rowSelection={rowSelection}
        {...restProps}
      />
      {showTotal && (
        <div
          className="table-info"
          style={{ textAlign: "right", paddingTop: "12px" }}
        >
          {/* <strong>
            Tổng số dòng: {rowData?.length || 0}
          </strong> */}
        </div>
      )}
    </div>
  );
};

export default Ctable;
