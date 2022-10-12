import React, { useState } from "react"
import Text from '@splunk/react-ui/Text'
import Button from '@splunk/react-ui/Button'
import ControlGroup from '@splunk/react-ui/ControlGroup';

export default function JobInspector() {
    const [value, setValue] = useState("")    

    const onChange = (e, {value}) => {
        setValue(value)
    }

    const onJobInspectorClick = (e) => {
        console.log(value)
        window.open(`/manager/search/job_inspector?sid=${value}`)   
    }

    const onJobDetailsClick = (e) => {
        console.log(value)
        window.open(`/app/search/job_details_dashboard?form.sid=${value}`)   
    }

    return (
        <>
        <ControlGroup label="Search SID">
        <Text value={value} onChange={onChange}></Text>
        </ControlGroup>

        <Button disabled={value == ''} appearance="primary" onClick={onJobInspectorClick}>Open in Job Inspector</Button>
        <Button disabled={value == ''} appearance="primary" onClick={onJobDetailsClick}>Open Job Details Dashboard</Button>
        </>
    )

}