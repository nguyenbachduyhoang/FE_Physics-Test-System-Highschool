import React from 'react';
import { Table } from 'antd';

const SafeTable = ({ dataSource, ...props }) => {
  const safeDataSource = React.useMemo(() => {
    console.log('SafeTable - Original dataSource:', dataSource, typeof dataSource);
    
    if (Array.isArray(dataSource)) {
      console.log('SafeTable - DataSource is array, length:', dataSource.length);
      return dataSource;
    }
    
    if (dataSource && typeof dataSource === 'object' && Array.isArray(dataSource.items)) {
      console.log('SafeTable - DataSource has items array, length:', dataSource.items.length);
      return dataSource.items;
    }
    
    if (dataSource && typeof dataSource === 'object' && Array.isArray(dataSource.data)) {
      console.log('SafeTable - DataSource has data array, length:', dataSource.data.length);
      return dataSource.data;
    }
    
    if (dataSource && typeof dataSource === 'object' && dataSource.data && Array.isArray(dataSource.data.items)) {
      console.log('SafeTable - DataSource has data.items array, length:', dataSource.data.items.length);
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

  console.log('SafeTable - Final safe dataSource:', safeDataSource.length, 'items');

  return (
    <Table 
      {...safeProps} 
      dataSource={safeDataSource}
    />
  );
};

export default SafeTable; 