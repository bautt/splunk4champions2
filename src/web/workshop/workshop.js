import React from 'react';
import Settings from '@splunk/react-icons/Settings';
import Activity from '@splunk/react-icons/Activity';
import Search from  '@splunk/react-icons/Search';
import Metrics from  '@splunk/react-icons/Metrics';
import Dashboard from  '@splunk/react-icons/Dashboard';

const labs = {
    chapters: [
        {
            "title": "1 - Settings",
            "id": "one",
            "icon": <Settings/>,
            "subtitle": "test",
            "sections": [
                {
                    "title": "Set your preferences",
                    "steps": [
                        {
                            "title": "Splunk Search Assistant",
                            "content": "chapter1/search_assistant_1.mdx"
                        },
                        {
                            "title": "Splunk Search Assistant",
                            "content": "chapter1/search_assistant_2.mdx"
                        },
                        {
                            "title": "Line Numbers",
                            "content": "chapter1/line_numbers.mdx"
                        },
                        {
                            "title": "Search auto-format",
                            "content": "chapter1/search_auto_format.mdx"
                        },
                        {
                            "title": "Useful links",
                            "content": "chapter1/useful_links.mdx"
                        }
                    ]
                },
                {
                    "title": "Search Mode",
                    "steps": [
                        {
                            "title": "Fast Mode",
                            "content": "chapter1/fast_mode.mdx"
                        },
                        {
                            "title": "Smart Mode",
                            "content": "chapter1/smart_mode.mdx"
                        },
                        {
                            "title": "Verbose Mode",
                            "content": "chapter1/verbose_mode.mdx"
                        },
                        {
                            "title": "Useful links",
                            "content": "chapter1/useful_links.mdx"
                        }
                    ]
                },
                {
                    "title": "Reformat Search",
                    "steps": [
                        {
                            "title": "Make searches easier to read",
                            "content": "chapter1/make_searches_easier_to_read.mdx"
                        }
                    ]
                },
                {
                    "title": "Language Settings",
                    "steps": [
                        {
                            "title": "User language and locale",
                            "content": "chapter1/user_language_locale.mdx"
                        }
                    ]
                }
            ]
        },
        {
            "title": "2 - Inspector",
            "id": "two",
            "subtitle": "test",
            "icon": <Activity/>,
            "sections": [
                {
                    "title": "Fun with Inspector #1",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "Fun with Inspector #2",
                    "steps": [
                        {
                            "title": "Optimize Searches 1",
                            "content": "chapter2/optimize_searches_1.mdx"
                        },
                        {
                            "title": "Optimize Searches 2",
                            "content": "chapter2/optimize_searches_2.mdx"
                        },
                        {
                            "title": "Optimize Searches 3",
                            "content": "chapter2/optimize_searches_3.mdx"
                        },
                    ]
                }
                
            ]
        },
        {
            "title": "3 - Search",
            "id": "three",
            "subtitle": "test",
            "icon": <Search/>,
            "sections": [
                {
                    "title": "Data Storage",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "What is in a Bucket",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "Search Tips",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "Distributed Architecture",
                    "steps": [
                        {
                            "title": "Optimize Searches 1",
                            "content": "chapter2/optimize_searches_1.mdx"
                        },
                        {
                            "title": "Optimize Searches 2",
                            "content": "chapter2/optimize_searches_2.mdx"
                        },
                        {
                            "title": "Optimize Searches 3",
                            "content": "chapter2/optimize_searches_3.mdx"
                        },
                    ]
                }
                
            ]
        },
        {
            "title": "4 - Metrics",
            "id": "four",
            "subtitle": "test",
            "icon": <Metrics/>,
            "sections": [
                {
                    "title": "Data Storage",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "What is in a Bucket",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "Search Tips",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "Distributed Architecture",
                    "steps": [
                        {
                            "title": "Optimize Searches 1",
                            "content": "chapter2/optimize_searches_1.mdx"
                        },
                        {
                            "title": "Optimize Searches 2",
                            "content": "chapter2/optimize_searches_2.mdx"
                        },
                        {
                            "title": "Optimize Searches 3",
                            "content": "chapter2/optimize_searches_3.mdx"
                        },
                    ]
                }
                
            ]
        },
        {
            "title": "5 - Dashboards",
            "id": "five",
            "subtitle": "test",
            "icon": <Dashboard/>,
            "sections": [
                {
                    "title": "Data Storage",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "What is in a Bucket",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "Search Tips",
                    "steps": [
                        {
                            "title": "Search Task",
                            "content": "chapter2/fun_with_job_inspector_search.mdx"
                        },
                        {
                            "title": "Open Inspector",
                            "content": "chapter2/fun_with_job_inspector_open.mdx"
                        }
                    ]
                },
                {
                    "title": "Distributed Architecture",
                    "steps": [
                        {
                            "title": "Optimize Searches 1",
                            "content": "chapter2/optimize_searches_1.mdx"
                        },
                        {
                            "title": "Optimize Searches 2",
                            "content": "chapter2/optimize_searches_2.mdx"
                        },
                        {
                            "title": "Optimize Searches 3",
                            "content": "chapter2/optimize_searches_3.mdx"
                        },
                    ]
                }
                
            ]
        }
    ]
}

export default labs