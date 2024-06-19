import React, {useEffect} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import IntegrationForm from './IntegrationForm';
import {withRequest} from 'HOCs';
import {edit} from 'Duck/integrations/actions';
import DocLink from 'Shared/DocLink/DocLink';
import IntegrationModalCard from 'Components/Client/Integrations/IntegrationModalCard';
import {configService} from "App/services";
import {toast} from "react-toastify";
import {debounce} from 'lodash';

const mapStateToProps = (state: any) => ({
    config: state.getIn(['elasticsearch', 'instance']),
});

const mapDispatchToProps = {
    edit,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {
    isValid: boolean;
}

const ElasticsearchForm: React.FC<Props> = (props) => {
    const {config, edit} = props;
    const [checkingConnection, setCheckingConnection] = React.useState(false);

    const checkConnection = async (params: any) => {
        setCheckingConnection(true);
        try {
            const res = await configService.checkElasticConnection(params);
            const isValid = res.state === 'true';
            if (!isValid) {
                toast.error("Invalid Elasticsearch configuration");
            }
            return isValid;
        } catch (e) {
            toast.error("Failed to check Elasticsearch connection");
            return false;
        } finally {
            setCheckingConnection(false);
        }
    };

    const debouncedCheckConnection = React.useCallback(debounce(checkConnection, 500), []);

    useEffect(() => {
        const {host, port, apiKeyId, apiKey} = config;

        const validateConnection = async () => {
            if (!checkingConnection && host && port && apiKeyId && apiKey) {
                const valid = await debouncedCheckConnection(config.toJSON());
                edit('elasticsearch', {isValid: valid});
            }
        };

        validateConnection();
    }, [config, edit]);

    return (
        <div className='bg-white h-screen overflow-y-auto' style={{width: '350px'}}>
            <IntegrationModalCard
                title='Elasticsearch'
                icon='integrations/elasticsearch'
                description='Integrate Elasticsearch with session replays to seamlessly observe backend errors.'
            />
            <div className='p-5 border-b mb-4'>
                <div className='font-medium mb-1'>How it works?</div>
                <ol className="list-decimal list-inside">
                    <li>Create a new Elastic API key</li>
                    <li>Enter the API key below</li>
                    <li>Propagate openReplaySessionToken</li>
                </ol>
                <DocLink
                    className='mt-4'
                    label='Integrate Elasticsearch'
                    url='https://docs.openreplay.com/integrations/elastic'
                />
            </div>
            <IntegrationForm
                {...props}
                loading={checkingConnection}
                name='elasticsearch'
                formFields={[
                    {key: 'host', label: 'Host'},
                    {key: 'apiKeyId', label: 'API Key ID'},
                    {key: 'apiKey', label: 'API Key'},
                    {key: 'indexes', label: 'Indexes'},
                    {key: 'port', label: 'Port', type: 'number'},
                ]}
            />
        </div>
    );
};

export default connector(ElasticsearchForm);
