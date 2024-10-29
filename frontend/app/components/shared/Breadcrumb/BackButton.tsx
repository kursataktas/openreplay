import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { LeftOutlined, ArrowLeftOutlined } from '@ant-design/icons';

function BackButton({ compact }: { compact?: boolean }) {
  const history = useHistory();
  const siteId = location.pathname.split('/')[1];

  const handleBackClick = () => {
    history.push(`/${siteId}/dashboard`);
  };
  if (compact) {
    return (
      <Button onClick={handleBackClick} type={'text'} icon={<ArrowLeftOutlined />} />
    )
  }
  return (
    <Button type="text" onClick={handleBackClick} icon={<LeftOutlined />} className="px-1 pe-2 me-2 gap-1">
      Back
    </Button>
  );
}

export default BackButton;
