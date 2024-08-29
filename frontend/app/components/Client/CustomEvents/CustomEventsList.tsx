import React, { useEffect } from 'react';
import cn from 'classnames';
import styles from 'Components/Client/Webhooks/webhooks.module.css';
import { Button, Divider, Icon, Loader, NoContent } from 'UI';
import AnimatedSVG from 'Shared/AnimatedSVG';
import { ICONS } from 'Shared/AnimatedSVG/AnimatedSVG';
import CustomEventItem from 'Components/Client/CustomEvents/CustomEventItem';
import { useStore } from 'App/mstore';
import { useModal } from 'Components/ModalContext';
import CustomEventForm from 'Components/Client/CustomEvents/CustomEventForm';
import { List } from 'antd';

function CustomEventsList() {
  const [loading, setLoading] = React.useState(false);
  const { customEventStore: store } = useStore();
  const { openModal } = useModal();

  // useEffect(() => {
  //   setLoading(true);
  //   store.fetchAll({}).finally(() => {
  //     setLoading(false);
  //   });
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 2000);
  // }, []);

  const init = () => {
    console.log('init');
    showEvent();
  };

  const showEvent = (event?: any) => {
    openModal(<CustomEventForm event={event} />, {
      title: event ? 'Edit Event' : 'Add Event',
      width: 400
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-5">
      <div className={cn(styles.tabHeader)}>
        <h3 className={cn(styles.tabTitle, 'text-2xl')}>{'Events'}</h3>
        <Button className="ml-auto" variant="primary" onClick={() => init()}>Add Event</Button>
      </div>

      <div className="text-base text-disabled-text flex items-center my-3 px-5">
        <Icon name="info-circle-fill" className="mr-2" size={16} />
        Leverage webhook notifications on alerts to trigger custom callbacks.
      </div>

      <Loader loading={loading}>
        <NoContent
          title={
            <div className="flex flex-col items-center justify-center">
              <AnimatedSVG name={ICONS.NO_WEBHOOKS} size={60} />
              <div className="text-center my-4">None added yet</div>
            </div>
          }
          size="small"
          show={store.list.length === 0}
        >
          <List dataSource={store.list} renderItem={(event) => (
            <List.Item onClick={showEvent}>
              <CustomEventItem event={event} />
            </List.Item>
          )} />
        </NoContent>
      </Loader>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  sites: state.getIn(['site', 'list'])
});

export default CustomEventsList;
