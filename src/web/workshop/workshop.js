import React from 'react';
import Settings from '@splunk/react-icons/Settings';
import Activity from '@splunk/react-icons/Activity';
import Search from  '@splunk/react-icons/Search';
import Metrics from  '@splunk/react-icons/Metrics';
import Dashboard from  '@splunk/react-icons/Dashboard';
import ChartScatter from  '@splunk/react-icons/ChartScatter';
import Data from  '@splunk/react-icons/Data';
import Emotion from '@emotion/stylis'


const labs = {
    chapters: [
        {
            "title": "1 - Settings",
            "id": "one",
            "icon": <Settings/>,
            "subtitle": "test",
            "sections": [
                {
                    "title": "1.1 Set your preferences",
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
                    "title": "1.2 Search Mode",
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
                    "title": "1.3 Reformat Search",
                    "steps": [
                        {
                            "title": "Make searches easier to read",
                            "content": "chapter1/make_searches_easier_to_read.mdx"
                        }
                    ]
                },
                {
                    "title": "1.4 Language Settings",
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
                    "title": "Using Job inspector",
                    "steps": [
                        {
                            "title": "Using Inspector",
                            "content": "chapter2/using_inspector.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter2/useful_links2.mdx"
                        }
                    ]
                },
                {
                    "title": "2.1 Fun with Inspector #1",
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
                    "title": "2.2 Fun with Inspector #2",
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
            "title": "3 - Data",
            "id": "three",
            "subtitle": "test",
            "icon": <Data/>,
            "sections": [
                {
                    "title": "How is data stored?",
                    "steps": [
                        {
                            "title": "Index and Buckets",
                            "content": "chapter3/index_and_buckets.mdx"
                        },
                       
                    ]
                },
                {
                    "title": "What is in a bucket?",
                    "steps": [
                        {
                            "title": "Inside a bucket",
                            "content": "chapter3/inside_bucket.mdx"
                        },
                       
                    ]
                },
                {
                    "title": "Distributed Architecture(s)",
                    "steps": [
                        {
                            "title": "Indexers and Clusters",
                            "content": "chapter3/indexers_and_clusters.mdx"
                        },
                       
                    ]
                },

                {
                    "title": "Data aging",
                    "steps": [
                        {
                            "title": "Indexers and Clusters",
                            "content": "chapter3/data_aging.mdx"
                        },
                       
                    ]
                }
                
            ]
        },
        {
            "title": "4 - Search",
            "id": "four",
            "subtitle": "test",
            "icon": <Search/>,
            "sections": [
                {
                    "title": "Search Basics",
                    "steps": [
                        {
                            "title": "Search Basics",
                            "content": "chapter4/basic_tipps.mdx"
                        },
                       
                    ]
                },
               
                {
                    "title": "tstats",
                    "steps": [
                        {
                            "title": "Using tstats",
                            "content": "chapter4/tstats.mdx"
                        }, 
                    ]
                },
                 
                {
                    "title": "TERM",
                    "steps": [
                        {
                            "title": "Using TERM",
                            "content": "chapter4/term.mdx"
                        }, 
                    ]
                },

                {
                    "title": "stats & joins",
                    "steps": [
                        {
                            "title": "Using stats",
                            "content": "chapter4/stats.mdx"
                        }, 
                        
                    ]
                },

                {
                    "title": "Quiz",
                    "steps": [
                        {
                            "title": "Search Quiz",
                            "content": "chapter4/quiz.mdx"
                        }, 
                        
                    ]
                },
                
            ]
        },
        {
            "title": "5 - Metrics",
            "id": "five",
            "subtitle": "test",
            "icon": <Metrics/>,
            "sections": [
                {
                    "title": "Metrics",
                    "steps": [
                        {
                            "title": "Metrics introduction",
                            "content": "chapter5/metrics_intro.mdx"
                        }
                    ]
                },
                {
                    "title": "Onboarding Metrics",
                    "steps": [
                        {
                            "title": "Onboarding Metrics",
                            "content": "chapter5/metrics_onboard.mdx"
                        }
                    ]
                },
                {
                    "title": "Searching Metrics",
                    "steps": [
                        {
                            "title": "Searching Metrics",
                            "content": "chapter5/metrics_search.mdx"
                        }
                    
                    ]
                },
                {
                    "title": "Metrics Lab",
                    "steps": [
                        {
                            "title": "Metrics Lab",
                            "content": "chapter5/metrics_lab.mdx"
                        }
                    ]
                }
                
            ]
        },
        {
            "title": "6 - Dashboards",
            "id": "six",
            "subtitle": "test",
            "icon": <Dashboard/>,
            "sections": [
                {
                    "title": "Base Search",
                    "steps": [
                        {
                            "title": "Base Search",
                            "content": "chapter6/base_search.mdx"
                        }
                    ]
                },
                {
                    "title": "Drilldown",
                    "steps": [
                        {
                            "title": "Drilldown",
                            "content": "chapter6/drilldown.mdx"
                        }
                    ]
                },
                {
                    "title": "Tokens",
                    "steps": [
                        {
                            "title": "Switch with tokens",
                            "content": "chapter6/tokens.mdx"
                        }
                    ]
                },
                {
                    "title": "Annotations",
                    "steps": [
                        {
                            "title": "Annotations",
                            "content": "chapter6/annotations.mdx"
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
            "title": "7 - Playground",
            "id": "seven",
            "subtitle": "test",
            "icon": <ChartScatter/>,
            "sections": [
                {
                    "title": "Setup",
                    "steps": [
                        {
                            "title": "Setup Task",
                            "content": "chapter7/setup_data.mdx"
                        }
                    ]
                },
                
                {
                    "title": "Follow Up Links",
                    "steps": [
                        {
                            "title": "Follow Up Links ",
                            "content": "chapter7/follow_up.mdx"
                        },
                       
                    ]
                },
                {
                    "title": "Syntax test",
                    "steps": [
                        {
                            "title": "Syntax test",
                            "content": "chapter7/test.mdx"
                        },
                       
                    ]
                },
                {
                    "title": "Quiz",
                    "steps": [
                        {
                            "title": "Syntax test",
                            "content": "chapter1/App.js"
                        },
                       
                    ]
                }
                
            ]
        }
    ]
}

export default labs