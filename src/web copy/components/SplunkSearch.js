import React, { useContext, useState } from 'react';
import Button from '@splunk/react-ui/Button'
import SearchBar from '@splunk/react-search/components/Bar';
import ClipBoard from '@splunk/react-icons/Clipboard';
import { TOAST_TYPES } from '@splunk/react-toast-notifications/ToastConstants';
import ToastContext from '../context'

function CopyToClipBoardButton({search}) {
    const createToast = useContext(ToastContext)


    const onClick = (e, value) => {
        console.info("Copied search to clipboard")
        navigator.clipboard.writeText(search)
        
        const toastProps = {
            message: `Search copied to clipboard`,
            type: TOAST_TYPES.SUCCESS,
        };
        createToast(toastProps);        
    }

    
    return (
    <Button 
    onClick={onClick}
    style={{maxWidth: '30px',
        marginLeft: '-40px',
        marginTop: '20px',
        height: '30px',
        lineHeight: '1',
        marginRight: '10px'}} icon={<ClipBoard screenReaderText={null} />} appearance='pill' label="Copy to Clipboard"/>
    )

}

export default function SplunkSearch({spl, earliest, latest}) {


    const formInputTypes = ['relative', 'realTime', 'date', 'dateTime'];
    const advancedInputTypes = ['relative', 'realTime', 'allTime', 'dateTime'];

    const presets = [
        { label: 'Today', earliest: '@d', latest: 'now' },
        { label: 'Week to date', earliest: '@w0', latest: 'now' },
        { label: 'Business week to date', earliest: '@w1', latest: 'now' },
        { label: 'Month to date', earliest: '@mon', latest: 'now' },
        { label: 'Year to date', earliest: '@y', latest: 'now' },
        { label: 'Yesterday', earliest: '-1d@d', latest: '@d' },
        { label: 'Previous week', earliest: '-7d@w0', latest: '@w0' },
        { label: 'Previous business week', earliest: '-6d@w1', latest: '-1d@w6' },
        { label: 'Previous month', earliest: '-1mon@mon', latest: '@mon' },
        { label: 'Previous year', earliest: '-1y@y', latest: '@y' },
        { label: 'Last 15 minutes', earliest: '-15m', latest: 'now' },
        { label: 'Last 60 minutes', earliest: '-60m@m', latest: 'now' },
        { label: 'Last 4 hours', earliest: '-4h@m', latest: 'now' },
        { label: 'Last 24 hours', earliest: '-24h@h', latest: 'now' },
        { label: 'Last 7 days', earliest: '-7d@h', latest: 'now' },
        { label: 'Last 30 days', earliest: '-30d@d', latest: 'now' },
        { label: 'All time', earliest: '0', latest: '' },
    ];

    const initialOptions = {
        earliest: earliest || '-48h@h',
        latest: latest || 'now',
        timePickerFormInputTypes: formInputTypes,
        timePickerPresets: presets,
        timePickerAdvancedInputTypes: advancedInputTypes,
        search: spl,
        enabled: false,
        componentAppendToInput: <CopyToClipBoardButton search={spl}></CopyToClipBoardButton>,
        syntax: {}
    }

    const [options, setOptions] = useState(initialOptions)

    
    const onOptionsChange = (newOptions) => {
        setOptions(prevState => ({
            ...prevState,
            ...newOptions
        }))
    }

    const onEventTrigger = (ev, value) => {
        console.log(options)

        const params = new URLSearchParams({
            q: options.search,
            earliest: options.earliest,
            latest: options.latest
        })

        window.open(`search?${params.toString()}`)
    }

    const syntax = "{}"
    return (
        <>
        <SearchBar onOptionsChange={onOptionsChange} onEventTrigger={onEventTrigger} options={options} syntax={syntax}/>
        </>
    )
}

