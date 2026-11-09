import React from 'react';
import Settings from '@splunk/react-icons/Cog';
import Search from '@splunk/react-icons/Magnifier';
import Metrics from '@splunk/react-icons/Metrics';
import Dashboard from '@splunk/react-icons/LayoutPanels';
import Tool from '@splunk/react-icons/Wrench';
import { TbAugmentedReality2, TbLayoutDashboard } from "react-icons/tb";
import { TbTrophy } from "react-icons/tb";
import Data from '@splunk/react-icons/Cylinder';

/**
 * The lab map.
 *
 * `shelf: "overflow"` moves a chapter off the primary tab strip and into one
 * grouped Legacy tab. The chapter stays in the app, deep links keep working.
 *
 * The live path is numbered in the order it appears:
 * 1 Settings, 2 Data, 3 Search, 4 Dashboard Studio, 5 Champion Quiz.
 * Legacy holds Metrics, XML Dashboards, and Mobile, without numbers,
 * so those shelves do not punch holes in the live path.
 * Setup (id "zero") is always the last primary tab. Large Room mode and
 * the colour scheme live on that page, not in the shell.
 *
 * Useful Links sections used to end every chapter. They are consolidated into
 * Setup -> Follow Up Links (chapter0/follow_up.mdx) rather than repeated.
 */

const labs = {
    chapters: [
        {
            "title": "1. Settings",
            "id": "one",
            "icon": <Settings/>,
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
                    "title": "Splunk AI Assistant",
                    "steps": [
                        {
                            "title": "Splunk AI Assistant",
                            "content": "chapter1/ai_assistant.mdx"
                        }
                    ]
                },
                {
                    "title": "Quiz",
                    "steps": [
                        {
                            "title": "Settings Quiz",
                            "content": "chapter1/quiz.mdx"
                        }
                    ]
                }
            ]
        },

        {
            "title": "2. Data",
            "id": "two",
            "icon": <Data/>,
            "sections": [
                {
                    "title": "How is data stored?",
                    "steps": [
                        {
                            "title": "Index and Buckets",
                            "content": "chapter2/index_and_buckets.mdx"
                        }
                    ]
                },
                {
                    "title": "What is in a bucket?",
                    "steps": [
                        {
                            "title": "Inside a bucket",
                            "content": "chapter2/inside_bucket.mdx"
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
                        }
                    ]
                },
                {
                    "title": "When a field exists",
                    "steps": [
                        {
                            "title": "When a field exists",
                            "content": "chapter2/schema_on_read.mdx"
                        }
                    ]
                },
                {
                    "title": "Distributed Architecture(s)",
                    "steps": [
                        {
                            "title": "Indexers and Clusters",
                            "content": "chapter2/indexers_and_clusters.mdx"
                        }
                    ]
                },
                {
                    "title": "Data aging",
                    "steps": [
                        {
                            "title": "Data Aging",
                            "content": "chapter2/data_aging.mdx"
                        }
                    ]
                },
                {
                    "title": "Smartstore",
                    "steps": [
                        {
                            "title": "Splunk Smartstore",
                            "content": "chapter2/smartstore.mdx"
                        }
                    ]
                },
                {
                    "title": "Quiz",
                    "steps": [
                        {
                            "title": "Data Quiz",
                            "content": "chapter2/quiz.mdx"
                        }
                    ]
                }
            ]
        },
        {
            "title": "3. Search",
            "id": "three",
            "icon": <Search/>,
            "sections": [
                {
                    "title": "Search Basics",
                    "steps": [
                        {
                            "title": "Search Basics",
                            "content": "chapter3/basic_tipps.mdx"
                        }
                    ]
                },
                {
                    "title": "Command Types",
                    "steps": [
                        {
                            "title": "Search Command Types",
                            "content": "chapter3/types.mdx"
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
                            "type": "lab",
                            "content": "chapter3/inspector_lab.mdx"
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
                        }
                    ]
                },
                {
                    "title": "tstats",
                    "steps": [
                        {
                            "title": "tstats and PREFIX",
                            "content": "chapter3/tstats.mdx"
                        }
                    ]
                },
                {
                    "title": "Bad Searches",
                    "steps": [
                        {
                            "title": "What makes searches slow",
                            "content": "chapter3/more_tips.mdx"
                        }
                    ]
                },
                {
                    "title": "Advanced SPL",
                    "steps": [
                        {
                            "title": "Eval patterns",
                            "content": "chapter3/eval_patterns.mdx"
                        },
                        {
                            "title": "Subsearches and alternatives",
                            "content": "chapter3/subsearch_patterns.mdx"
                        },
                        {
                            "title": "rex field extraction",
                            "content": "chapter3/rex_patterns.mdx"
                        }
                    ]
                },
                {
                    "title": "Search Lab",
                    "steps": [
                        {
                            "title": "The Investigation",
                            "type": "lab",
                            "content": "chapter3/investigation.mdx"
                        }
                    ]
                },
                // SPL2 and MCP come before the Search Quiz so the quiz can draw on them.
                {
                    "title": "SPL2",
                    "steps": [
                        {
                            "title": "SPL2 Overview",
                            "content": "chapter3/spl2_overview.mdx"
                        },
                        {
                            "title": "SPL2 Modules",
                            "content": "chapter3/spl2_modules.mdx"
                        }
                    ]
                },
                {
                    "title": "MCP",
                    "steps": [
                        {
                            "title": "Splunk MCP Server",
                            "content": "chapter3/mcp_splunk.mdx"
                        }
                    ]
                },
                {
                    "title": "Search Quiz",
                    "steps": [
                        {
                            "title": "Search Quiz",
                            "content": "chapter3/search_quiz.mdx"
                        }
                    ]
                }
            ]
        },

        // Legacy: Metrics
        {
            "title": "Metrics",
            "id": "four",
            "shelf": "overflow",
            "subtitle": "",
            "icon": <Metrics/>,
            "sections": [
                {
                    "title": "Metrics",
                    "steps": [
                        {
                            "title": "Metrics introduction",
                            "content": "chapter4/metrics_intro.mdx"
                        }
                    ]
                },
                {
                    "title": "Onboarding Metrics",
                    "steps": [
                        {
                            "title": "Onboarding Metrics",
                            "content": "chapter4/metrics_onboard.mdx"
                        }
                    ]
                },
                {
                    "title": "Searching Metrics",
                    "steps": [
                        {
                            "title": "Searching Metrics",
                            "content": "chapter4/metrics_search.mdx"
                        }
                    ]
                },
                {
                    "title": "Weather Data Reference",
                    "steps": [
                        {
                            "title": "TA-open-meteo Data Schema",
                            "content": "chapter4/meteo_data.mdx"
                        }
                    ]
                },
                {
                    "title": "Metrics Lab",
                    "steps": [
                        {
                            "title": "Metrics Lab",
                            "type": "lab",
                            "content": "chapter4/metrics_lab.mdx"
                        }
                    ]
                },
                {
                    "title": "Stock Index Metrics",
                    "steps": [
                        {
                            "title": "Stocks — Events to Metrics",
                            "type": "lab",
                            "content": "chapter4/stocks_metrics.mdx"
                        }
                    ]
                },
                {
                    "title": "Phyphox Experiments",
                    "steps": [
                        {
                            "title": "Phyphox Experiments",
                            "content": "chapter4/phyphox.mdx"
                        }
                    ]
                },
                {
                    "title": "Quiz",
                    "steps": [
                        {
                            "title": "Metrics Quiz",
                            "content": "chapter4/quiz.mdx"
                        }
                    ]
                }
            ]
        },

        // Legacy: XML Dashboards
        {
            "title": "XML Dashboards",
            "id": "five",
            "shelf": "overflow",
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
                        }
                    ]
                }
            ]
        },
        {
            "title": "4. Dashboard Studio",
            "id": "six",
            "subtitle": "",
            "icon": <TbLayoutDashboard/>,
            "sections": [
                {
                    "title": "Overview",
                    "steps": [
                        {
                            "title": "Overview",
                            "content": "chapter6/studio.mdx"
                        }
                    ]
                },
                {
                    "title": "Chain Searches",
                    "steps": [
                        {
                            "title": "Chain Searches",
                            "content": "chapter6/ds_base.mdx"
                        }
                    ]
                },
                {
                    "title": "Token Kitchen",
                    "steps": [
                        {
                            "title": "Token Kitchen",
                            "type": "lab",
                            "content": "chapter6/ds_token_kitchen.mdx"
                        }
                    ]
                },
                {
                    "title": "Image Upload",
                    "steps": [
                        {
                            "title": "Image Upload",
                            "content": "chapter6/ds_images.mdx"
                        }
                    ]
                },
                {
                    "title": "Custom Viz",
                    "steps": [
                        {
                            "title": "Goal and data",
                            "type": "lab",
                            "content": "chapter9/goal.mdx"
                        },
                        {
                            "title": "Create the project",
                            "type": "lab",
                            "content": "chapter9/scaffold.mdx"
                        },
                        {
                            "title": "Build the scaffold",
                            "type": "lab",
                            "content": "chapter9/build.mdx"
                        },
                        {
                            "title": "Draw the bars",
                            "type": "lab",
                            "content": "chapter9/bars.mdx"
                        },
                        {
                            "title": "Install and open in Studio",
                            "type": "lab",
                            "content": "chapter9/install.mdx"
                        },
                        {
                            "title": "One small LLM change",
                            "type": "lab",
                            "content": "chapter9/llm.mdx"
                        },
                        {
                            "title": "Check and show",
                            "content": "chapter9/check.mdx"
                        },
                        {
                            "title": "If you get stuck",
                            "content": "chapter9/stuck.mdx"
                        },
                        {
                            "title": "Trainer notes",
                            "content": "chapter9/trainer.mdx"
                        }
                    ]
                },
                {
                    "title": "Sharing",
                    "steps": [
                        {
                            "title": "Sharing",
                            "type": "lab",
                            "content": "chapter6/ds_publish.mdx"
                        }
                    ]
                }
            ]
        },

        // Legacy: Mobile (includes Spacebridge explanation in chapter7/mobileintro.mdx)
        {
            "title": "Mobile",
            "id": "seven",
            "shelf": "overflow",
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
                }
            ]
        },

        {
            "title": "5. Champion Quiz",
            "id": "eight",
            "subtitle": "Test your knowledge",
            "icon": <TbTrophy/>,
            "sections": [
                {
                    "title": "Take the Quiz",
                    "steps": [
                        {
                            "title": "Splunk4Champions Quiz",
                            "content": "chapter8/quiz.mdx"
                        }
                    ]
                }
            ]
        },
        {
            "title": "Setup",
            "id": "zero",
            "icon": <Tool/>,
            "sections": [
                {
                    "title": "Setup",
                    "steps": [
                        {
                            "title": "Setup",
                            "content": "chapter0/setup_data.mdx"
                        }
                    ]
                },
                {
                    "title": "Readme",
                    "steps": [
                        {
                            "title": "Readme",
                            "content": "chapter0/readme.mdx"
                        }
                    ]
                },
                {
                    "title": "What's new",
                    "steps": [
                        {
                            "title": "What's new",
                            "content": "chapter0/whatsnew.mdx"
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
