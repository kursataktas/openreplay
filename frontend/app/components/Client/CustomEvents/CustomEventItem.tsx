import React from 'react';

interface Props {
  event: any;
}

function CustomEventItem(props: Props) {
  return (
    <div className="flex">
      <div>{props.event.name}</div>
      <div>{props.event.user?.name}</div>
      {/*<div>{props.event.created_at}</div>*/}
    </div>
  );
}

export default CustomEventItem;
