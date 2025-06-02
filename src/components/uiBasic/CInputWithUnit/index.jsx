import React from 'react';
import { Select, Divider } from 'antd';
import CInputLabel from '../CInputLabel';
import PropTypes from 'prop-types';
import './index.scss';

const { Option } = Select;

const CInputWithUnit = ({ 
  label, 
  value, 
  onChange, 
  min,
  units,
  onUnitChange,
  style,
  unitSelectStyle,
  ...props 
}) => {
  return (
    <CInputLabel
      label={label}
      type="number"
      min={min}
      value={value}
      onChange={onChange}
      style={{ ...style, width: '100%' }}
      suffix={
        <div className="unit-selector">
          <Divider type="vertical" className="unit-divider" />
          <Select 
            style={unitSelectStyle || { width: 90 }}
            placeholder="Đơn vị"
            onChange={onUnitChange}
            onClick={e => e.stopPropagation()}
            popupMatchSelectWidth={false}
          >
            {units?.map(unit => (
              <Option key={unit.value} value={unit.value}>
                {unit.label}
              </Option>
            ))}
          </Select>
        </div>
      }
      {...props}
    />
  );
};

CInputWithUnit.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  min: PropTypes.number,
  units: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string
  })).isRequired,
  onUnitChange: PropTypes.func,
  style: PropTypes.object,
  unitSelectStyle: PropTypes.object
};

export default CInputWithUnit; 