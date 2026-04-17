import React from 'react';
import Settings from '@splunk/react-icons/Settings';
import Activity from '@splunk/react-icons/Activity';
import Search from  '@splunk/react-icons/Search';
import Metrics from  '@splunk/react-icons/Metrics';
import Dashboard from  '@splunk/react-icons/Dashboard';
import Images from  '@splunk/react-icons/Images';
import ChartScatter from  '@splunk/react-icons/ChartScatter';
import Tool from  '@splunk/react-icons/Tool';
import Data from  '@splunk/react-icons/Data';
import GaugeRadial from '@splunk/react-icons/GaugeRadial';
import { TbAugmentedReality2, TbLayoutDashboard, TbDatabase } from "react-icons/tb";
import {GrConfigure} from "react-icons/gr";

const labs = {
    chapters: [
        {
            "title": "1. Settings",
            "id": "one",
            "icon": <Settings/>,
            "subtitle": "test",
            "sections": [
                {
                    "title": "Set your preferences",
                    "steps": [
                        {
                            "title": "Splunk Search Assistant",
                            "content": "chapter1/search_assistant_2.mdx"
                        },
                        {
                            "title": "Line Numbers",
                            "content": "chapter1/line_numbers.mdx"
                        },
                        {
                            "title": "Themes",
                            "content": "chapter1/themes.mdx"
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
                        }
                    ]
                },
                {
                    "title": "SPL Readability",
                    "steps": [
                        {
                            "title": "Auto-format",
                            "content": "chapter1/search_auto_format.mdx"
                        },
                        {
                            "title": "Keyboard Shortcuts",
                            "content": "chapter1/make_searches_easier_to_read.mdx"
                        },
                        {
                            "title": "Inline Comments",
                            "content": "chapter1/comments.mdx"
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
                },
                {
                    "title": "SPL2",
                    "steps": [
                        {
                            "title": "SPL2 Overview",
                            "content": "chapter1/spl2_overview.mdx"
                        },
                        {
                            "title": "SPL2 Modules",
                            "content": "chapter1/spl2_modules.mdx"
                        }
                    ]
                },
                {
                    "title": "Useful Links",
                    "steps": [
                        {
                            "title": "Useful Links",
                            "content": "chapter1/useful_links.mdx"
                        }
                    ]
                }
            ]
        },
        
        {
            "title": "2. Data",
            "id": "two",
            "subtitle": "test",
            "icon": <Data/>,
            "sections": [
                {
                    "title": "How is data stored?",
                    "steps": [
                        {
                            "title": "Index and Buckets",
                            "content": "chapter2/index_and_buckets.mdx"
                        }, 
                        {
                            "title": "Useful Links",
                            "content": "chapter2/useful_links3.mdx"
                        }
                       
                    ]
                },
                {
                    "title": "What is in a bucket?",
                    "steps": [
                        {
                            "title": "Inside a bucket",
                            "content": "chapter2/inside_bucket.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter2/useful_links3.mdx"
                        }
                       
                    ]
                },
                {
                    "title": "Data Pipeline",
                    "steps": [
                        {
                            "title": "Pipeline",
                            "content": "chapter2/pipeline.mdx"
                        },
                        {
                            "title": "Segmentation",
                            "content": "chapter2/segmentation.mdx"
                        },
                        {
                            "title": "Highlighting TERMs",
                            "content": "chapter2/termshigh.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter2/useful_links3.mdx"
                        }
                    ]
                },
                {
                    "title": "Distributed Architecture(s)",
                    "steps": [
                        {
                            "title": "Indexers and Clusters",
                            "content": "chapter2/indexers_and_clusters.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter2/useful_links3.mdx"
                        }
                       
                    ]
                },

                {
                    "title": "Data aging",
                    "steps": [
                        {
                            "title": "Data Aging",
                            "content": "chapter2/data_aging.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter2/useful_links3.mdx"
                        }
                       
                    ]
                }, 
                {
                    "title": "Smartstore",
                    "steps": [
                        {
                            "title": "Splunk Smartstore",
                            "content": "chapter2/smartstore.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter2/useful_links3.mdx"
                        }
                       
                    ]
                }
                
            ]
        },
        {
            "title": "3. Search",
            "id": "three",
            "subtitle": "test",
            "icon": <Search/>,
            "sections": [
                {
                    "title": "Search Basics",
                    "steps": [
                        {
                            "title": "Search Basics",
                            "content": "chapter3/basic_tipps.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter3/useful_links4.mdx"
                        }
                       
                    ]
                },
               
                {
                    "title": "Command Types",
                    "steps": [
                        {
                            "title": "Search Command Types",
                            "content": "chapter3/types.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter3/useful_links4.mdx"
                        }
                    ]
                },
                {
                    "title": "Inspector",
                    "steps": [
                        {
                            "title": "Using Inspector",
                            "content": "chapter3/using_inspector.mdx"
                        },
                        {
                            "title": "Inspector Lab",
                            "content": "chapter3/inspector_lab.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter3/inspector_useful_links.mdx"
                        }
                    ]
                },

                {
                    "title": "Terms",
                    "steps": [
                        {
                            "title": "Segmentation (Recap)",
                            "content": "chapter2/segmentation.mdx"
                        },
                        {
                            "title": "Walklex",
                            "content": "chapter3/walklex.mdx"
                        },
                        {
                            "title": "TERM Directive",
                            "content": "chapter3/term.mdx"
                        },

                        {
                            "title": "Highlighting TERMs",
                            "content": "chapter2/termshigh.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter3/useful_links4.mdx"
                        }
                    ]
                },
                {
                    "title": "tstats",
                    "steps": [
                        {
                            "title": "tstats and PREFIX",
                            "content": "chapter3/tstats.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter3/useful_links4.mdx"
                        }
                    ]
                },

                {
                    "title": "Search Tips",
                    "steps": [
                        {
                            "title": "What makes searches slow",
                            "content": "chapter3/more_tips.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter3/useful_links4.mdx"
                        }
                        
                    ]
                },

                {
                    "title": "Quiz",
                    "steps": [
                        {
                            "title": "Quiz",
                            "content": "chapter3/quiz.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter3/useful_links4.mdx"
                        }
                        
                    ]
                },
                
            ]
        },

        {
            "title": "4. Metrics",
            "id": "four",
            "subtitle": "",
            "icon": <Metrics/>,
            "sections": [
                {
                    "title": "Metrics",
                    "steps": [
                        {
                            "title": "Metrics introduction",
                            "content": "chapter4/metrics_intro.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter4/useful_links5.mdx"
                        }
                    ]
                },
                {
                    "title": "Onboarding Metrics",
                    "steps": [
                        {
                            "title": "Onboarding Metrics",
                            "content": "chapter4/metrics_onboard.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter4/useful_links5.mdx"
                        }
                    ]
                },
                {
                    "title": "Searching Metrics",
                    "steps": [
                        {
                            "title": "Searching Metrics",
                            "content": "chapter4/metrics_search.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter4/useful_links5.mdx"
                        }
                    
                    ]
                },
                {
                    "title": "Weather Data Reference",
                    "steps": [
                        {
                            "title": "TA-open-meteo Data Schema",
                            "content": "chapter4/meteo_data.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter4/useful_links5.mdx"
                        }
                    ]
                },
                {
                    "title": "Metrics Lab",
                    "steps": [
                        {
                            "title": "Metrics Lab",
                            "content": "chapter4/metrics_lab.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter4/useful_links5.mdx"
                        }
                    ]
                },
                {
                    "title": "Phyphox Experiments",
                    "steps": [
                        {
                            "title": "Phyphox Experiments",
                            "content": "chapter4/phyphox.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter4/useful_links5.mdx"
                        }
                    ]
                }
                
            ]
        },
        {
            "title": "5. XML Dashboards",
            "id": "five",
            "subtitle": "test",
            "icon": <Dashboard/>,
            "sections": [
                {
                    "title": "Base Search",
                    "steps": [
                        {
                            "title": "Base Search",
                            "content": "chapter5/base_search.mdx"
                        }
                    ]
                },
                {
                    "title": "Drilldown",
                    "steps": [
                        {
                            "title": "Drilldown",
                            "content": "chapter5/drilldown.mdx"
                        }
                    ]
                },
                {
                    "title": "Tokens",
                    "steps": [
                        {
                            "title": "Switch with tokens",
                            "content": "chapter5/tokens.mdx"
                        }
                    ]
                },
                {
                    "title": "Annotations",
                    "steps": [
                        {
                            "title": "Annotations",
                            "content": "chapter5/annotations.mdx"
                        }
                
                    ]
                }, 
                {
                    "title": "Colors",
                    "steps": [
                        {
                            "title": "I see colors everywhere",
                            "content": "chapter5/colors.mdx"
                        }
                
                    ]
                }, 
                {
                    "title": "Pseudonymization",
                    "steps": [
                        {
                            "title": "Hide user names",
                            "content": "chapter5/pseudonymization.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter5/useful_links5.mdx"
                        }

                    ]
                }
                
            ]
        },
        {
            "title": "6. Dashboard Studio",
            "id": "six",
            "subtitle": "",
            "icon": <TbLayoutDashboard/>,
            "sections": [
                {
                    "title": "Overview",
                    "steps": [
                        {
                            "title": "Dashboard Studio Concepts",
                            "content": "chapter6/studio.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                },
                {
                    "title": "Tutorial",
                    "steps": [
                        {
                            "title": "Build Your First Dashboard",
                            "content": "chapter6/ds_tutorial.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                },
                {
                    "title": "Data Sources",
                    "steps": [
                        {
                            "title": "Base & Chain Searches",
                            "content": "chapter6/ds_base.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                },
                {
                    "title": "Interactivity",
                    "steps": [
                        {
                            "title": "Tokens, Buttons & Conditional Panels",
                            "content": "chapter6/ds_tokens.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                },
                {
                    "title": "Layout & Visualizations",
                    "steps": [
                        {
                            "title": "Working with Images",
                            "content": "chapter6/ds_images.mdx"
                        },
                        {
                            "title": "Annotations",
                            "content": "chapter6/ds_annotations.mdx"
                        },
                        {
                            "title": "Tabbed Dashboards",
                            "content": "chapter6/ds_tabbed.mdx"
                        },
                        {
                            "title": "Trellis Layout",
                            "content": "chapter6/ds_trellis.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                },
                {
                    "title": "Custom Visualizations",
                    "steps": [
                        {
                            "title": "Custom Viz — Three Approaches",
                            "content": "chapter6/ds_customviz.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                },
                {
                    "title": "Canvas Viz Library",
                    "steps": [
                        {
                            "title": "Canvas Visualizations by rcastley",
                            "content": "chapter6/ds_rcastley_vizs.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                },
                {
                    "title": "Sharing & Security",
                    "steps": [
                        {
                            "title": "Publish without Login",
                            "content": "chapter6/ds_publish.mdx"
                        },
                        {
                            "title": "Useful Links",
                            "content": "chapter6/useful_links6.mdx"
                        }
                    ]
                }
            ]
        },
        {
            "title": "7. Mobile",
            "id": "seven",
            "subtitle": "Splunk Mobile",
            "icon": <TbAugmentedReality2/>,
            "sections": [
                {
                    "title": "Introduction",
                    "steps": [
                        {
                            "title": "Splunk Mobile",
                            "content": "chapter7/mobileintro.mdx"
                        }
                    ]
                },
                
                {
                    "title": "Setup Mobile",
                    "steps": [
                        {
                            "title": "Setup the Gateway and add your device",
                            "content": "chapter7/mobilesetup.mdx"
                        }
                       
                    ]
                },
                {
                    "title": "Mobile Links",
                    "steps": [
                        {
                            "title": "Mobile Links",
                            "content": "chapter7/mobilelinks.mdx"
                        }
                       
                    ]
                }
                
            ]
        },
        {
            "title": "Setup",
            "id": "zero",
            "subtitle": "test",
            "icon": <Tool/>,
            "sections": [
                {
                    "title": "Setup",
                    "steps": [
                        {
                            "title": "Setup Task",
                            "content": "chapter0/setup_data.mdx"
                        }
                    ]
                },
                
                {
                    "title": "Follow Up Links",
                    "steps": [
                        {
                            "title": "Follow Up Links ",
                            "content": "chapter0/follow_up.mdx"
                        }
                       
                    ]
                },
                {
                    "title": "Credits",
                    "steps": [
                        {
                            "title": "Credits",
                            "content": "chapter0/credits.mdx"
                        }
                       
                    ]
                }
                
            ]
        }
       
    ]
}

export default labs