import React from 'react';
import { Table } from 'antd';

const SafeTable = ({ dataSource, ...props }) => {
  const safeDataSource = React.useMemo(() => {
    
    if (Array.isArray(dataSource)) {
      return dataSource;
    }
    
    if (dataSource && typeof dataSource === 'object' && Array.isArray(dataSource.items)) {
      return dataSource.items;
    }
    
    if (dataSource && typeof dataSource === 'object' && Array.isArray(dataSource.data)) {
      return dataSource.data;
    }
    
    if (dataSource && typeof dataSource === 'object' && dataSource.data && Array.isArray(dataSource.data.items)) {
      return dataSource.data.items;

    }
    
    console.warn('SafeTable - Invalid dataSource format, returning empty array:', dataSource);
    return [];
  }, [dataSource]);

  const safeProps = React.useMemo(() => {
    const newProps = { ...props };
    
    // Ensure rowKey is valid
    if (!newProps.rowKey) {
      newProps.rowKey = (record, index) => record.id || record.key || `row-${index}`;
    }
    
    return newProps;
  }, [props]);


  return (
    <Table 
      {...safeProps} 
      dataSource={safeDataSource}
    />
  );
};

export default SafeTable; 