import React from 'react';
import MetricListItem from '../MetricListItem';
import { Checkbox } from 'UI';

interface Props {
  list: any;
  siteId: any;
  selectedList: any;
  toggleSelection?: (metricId: any) => void;
  toggleAll?: (e: any) => void;
  disableSelection?: boolean
}
function ListView(props: Props) {
  const { siteId, list, selectedList, toggleSelection, disableSelection = false } = props;
  return (
    <div>
      <div className="grid grid-cols-12 py-2 font-medium px-6">
        {!disableSelection && (
          <div className="col-span-4 flex items-center">
          <Checkbox
            name="slack"
            className="mr-4"
            type="checkbox"
            checked={selectedList.length === list.length}
            // onClick={() => selectedList(list.map((i: any) => i.metricId))}
            onClick={props.toggleAll}
          />
          <span>Title</span>
        </div>
        )}
        <div className="col-span-4">Owner</div>
        <div className="col-span-2">Visibility</div>
        <div className="col-span-2 text-right">Last Modified</div>
      </div>
      {list.map((metric: any) => (
        <MetricListItem
          disableSelection={disableSelection}
          metric={metric}
          siteId={siteId}
          selected={selectedList.includes(parseInt(metric.metricId))}
          toggleSelection={(e: any) => {
            e.stopPropagation();
            toggleSelection && toggleSelection(parseInt(metric.metricId));
          }}
        />
      ))}
    </div>
  );
}

export default ListView;
