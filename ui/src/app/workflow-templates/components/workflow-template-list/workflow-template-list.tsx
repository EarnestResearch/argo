import {MockupList, Page} from 'argo-ui';
import * as React from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import * as models from '../../../../models';
import {uiUrl} from '../../../shared/base';
import {BasePage} from '../../../shared/components/base-page';
import {Timestamp} from '../../../shared/components/timestamp';
import {searchToMetadataFilter} from '../../../shared/filter';
import {services} from '../../../shared/services';

require('./workflow-template-list.scss');

interface State {
    templates?: models.WorkflowTemplate[];
}

export class WorkflowTemplateList extends BasePage<RouteComponentProps<any>, State> {
    private get search() {
        return this.queryParam('search') || '';
    }

    private set search(search) {
        this.setQueryParams({search});
    }

    constructor(props: any) {
        super(props);
        this.state = {};
    }

    public componentDidMount(): void {
        services.workflowTemplate.list('').then(templates => {
            this.setState({templates});
        });
    }

    public render() {
        return (
            <Page
                title='Workflow Templates'
                toolbar={{
                    breadcrumbs: [{title: 'Workflow Templates', path: uiUrl('workflow-templates')}]
                }}>
                <div className='argo-container'>{this.renderTemplates()}</div>
            </Page>
        );
    }

    private renderTemplates() {
        if (this.state.templates === undefined) {
            return <MockupList />;
        }
        const learnMore = <a href='https://github.com/argoproj/argo/blob/apiserverimpl/docs/workflow-templates.md'>Learn more</a>;
        if (this.state.templates.length === 0) {
            return (
                <div className='white-box'>
                    <h4>No workflow templates</h4>
                    <p>You can create new templates using the CLI.</p>
                    <p>{learnMore}.</p>
                </div>
            );
        }
        const filter = searchToMetadataFilter(this.search);
        const templates = this.state.templates.filter(tmpl => filter(tmpl.metadata));
        return (
            <>
                <p>
                    <i className='fa fa-search' />
                    <input
                        className='argo-field'
                        defaultValue={this.search}
                        onChange={e => {
                            this.search = e.target.value;
                        }}
                        placeholder='e.g. name:hello-world namespace:argo'
                    />
                </p>
                {templates.length === 0 ? (
                    <p>No workflow templates found</p>
                ) : (
                    <div className={'argo-table-list'}>
                        <div className='row argo-table-list__head'>
                            <div className='columns small-4'>NAME</div>
                            <div className='columns small-4'>NAMESPACE</div>
                            <div className='columns small-4'>CREATED</div>
                        </div>
                        {templates.map(t => (
                            <Link className='row argo-table-list__row' key={t.metadata.name} to={uiUrl(`workflow-templates/${t.metadata.namespace}/${t.metadata.name}`)}>
                                <div className='columns small-4'>{t.metadata.name}</div>
                                <div className='columns small-4'>{t.metadata.namespace}</div>
                                <div className='columns small-4'>
                                    <Timestamp date={t.metadata.creationTimestamp} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <p>
                    <i className='fa fa-info-circle' /> Workflow templates are reusable templates you can create new workflows from. {learnMore}.
                </p>
            </>
        );
    }
}