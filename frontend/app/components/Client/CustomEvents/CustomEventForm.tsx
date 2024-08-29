import React from 'react';
import { Button, Form, Input } from 'antd';
import { FormField } from 'semantic-ui-react';

interface Props {
  event?: any;
}

function CustomEventForm(props: Props) {
  return (
    <div>
      <Form layout="vertical">
        <FormField>
          <label>Name</label>
          <Input />
        </FormField>

        <Button type="primary">
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default CustomEventForm;
