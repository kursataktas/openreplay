import React from 'react';
import { NoContent } from 'UI';
import { Styles } from '../../common';
import { 
    BarChart, Bar, CartesianGrid, Tooltip,
    LineChart, Line, Legend, ResponsiveContainer, 
    XAxis, YAxis
  } from 'recharts';

interface Props {
    data: any
    metric?: any
}
function CallsErrors4xx(props: Props) {
    const { data, metric } = props;
    console.log('asd', metric.data.namesMap)
    return (
        <NoContent
          size="small"
          show={ metric.data.chart.length === 0 }
        >
          <ResponsiveContainer height={ 240 } width="100%">
            <BarChart
              data={metric.data.chart}
              margin={Styles.chartMargins}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={ false } stroke="#EEEEEE" />
              <XAxis
                {...Styles.xaxis}
                dataKey="time"
                interval={metric.params.density/7}
              />
              <YAxis
                {...Styles.yaxis}
                label={{ ...Styles.axisLabelLeft, value: "Number of Errors" }}
                allowDecimals={false}
              />
              <Legend />
              <Tooltip {...Styles.tooltip} />
              { Array.isArray(metric.data.namesMap) && metric.data.namesMap.map((key, index) => (
                <Line key={key} name={key} type="monotone" dataKey={key} stroke={Styles.colors[index]} fillOpacity={ 1 } strokeWidth={ 2 } strokeOpacity={ 0.8 } fill="url(#colorCount)" dot={false} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </NoContent>
    );
}

export default CallsErrors4xx;