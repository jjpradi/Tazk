import { getsessionStorage } from "./login/cookies"

 const adminPayrollDashboard = [
    {
        "approvedCard": [
            {
                "count": 0
            }
        ]
    },
    {
        "absentCard": [
            {
                "absent_count": 0
            }
        ]
    },
    {
        "earlyCheckoutCard": [
            {
                "earlyCheckOut": 0
            }
        ]
    },
    {
        "employeeCard": [
            {
                "empCount": 0
            }
        ]
    },
    {
        "holidayCard": [
            {
                "holiday_count": 0
            }
        ]
    },
       {
        "activeLoans": [
            {
                "activeLoansTotal": 0,
                "activeLoansDue": 0
            }
        ]
    },
    {
        "openRequests": [
            {
                "totalOpenRequests": 0,
            }
        ]
    },
    {
        "lateCheckCard": [
            {
                "lateCheckIn": 0
            }
        ]
    },
    {
        "presentCard": [
            {
                "present_count": 0
            }
        ]
    },
    {
        "earlyCheckIn": [
            {
                "earlyCheckIn": 0
            }
        ]
    },
    {
        "attendanceRate": [
            {
                "average_network_hours": 0,
                "totalworkedDays": 0,
                "average_worked_days_perc_all": 0,
                "employeeDetails": 0
            }
        ]
    },
    {
        "experienceCard": []
    },
    {
        "checkedInCard": [
            {
                "checkIn": [],
                "notCheckIn": []
            }
        ]
    },
    {
        "EmployeeBasedDepartment": [
            {
                "department": []
            }
        ]
    },
    {
        "EmployeeSalaryByDepartmentAndCategory": [
            {
                "salaryByDepartment": [],
                "salaryByCategory": []
            }
        ]
    },
    {
        "GenderRatio": [
            {
                "genderRatio": []
            }
        ]
    },
    {
        "AttendanceByDep": [
            {
                "attBasedOnDept": []
            }
        ]
    },
    {
        "LeaveTypeDistribution": [
            {
                "leaveTypePercentage": []
            }
        ]
    },
    {
        "OverallAttendance": [
            {
                "data": []
            }
        ]
    },
    {
        "lateLoginCard": [
            {
                "lateInEarlyOutDuration": []
            }
        ]
    },
    {
        "locationWiseAttendanceCard": [
            {
                "data": []
            }
        ]
    },
    {
        "AttendanceStatistics": [
            {
                "data": []
            }
        ]
    },
    {
        "topEmpByAttendance": [
            {
                "overall_percentage": [],
                "avg_wrk_hrs": [],
                "Total_leave": []
            }
        ]
    },
    {
        "costSummary": [
            {
                "allowanceData": []
            }
        ]
    },
    {
        "leavesStatusCard": [
            {
                "data": []
            }
        ]
    }
]

const employeePayrollDashboard = [
    {
        "EmployeeLateCheckCards": [
            {
                "late_login_count": 0
            }
        ]
    },
    {
        "EarlyCheckoutEmp": [
            {
                "early_out_count": 0
            }
        ]
    },
    {
        "TotalDaysWorkedCountCard": [
            {
                "working_days": 0,
                "leaveCount": 0,
                "permissionsTaken": 0
            }
        ]
    },
    {
        "EmployeeRankScoreCard": [
            {
                "overall_percentage": null,
                "late_login_percentage": 0,
                "early_out_percentage": 0,
                "leave_percentage": 0,
                "work_hours_percentage": null,
                "company_rank": 0
            }
        ]
    },
    {
        "LeaveBalanceCard": [
            {
                "maxPlPerMonth": 0,
                "currentMonthPl": 0,
                "workLog": []
            }
        ]
    }
]

const POSdashboard = [
    {
        "expenseCard": [
            {
                "monthtotal": 0,
                "PreMonthTotal": 0
            }
        ]
    },
    {
        "spendingCard": [
            {
                "ledger_id": null,
                "name": null,
                "amount": 0
            }
        ]
    },
    {
        "cashInHandCard": [
            {
                "closing_balance": 0
            }
        ]
    },
    {
        "roiCard": [
            {
                "roi": 0
            }
        ]
    },
    {
        "netProfitCard": [
            {
                "salesamount": 0,
                "purchaseamount": 0,
                "indirectexpenses": 0,
                "netprofit": 0
            }
        ]
    },
    {
        "bankBalanceCard": [
            {
                "amount": 0
            }
        ]
    },
    {
        "totalCard": [
            {
                "total": 0,
                "PreFinacialTotal": 0
            }
        ]
    },
    {
        "availStockCard": [
            {
                "grandTotal": 0
            }
        ]
    },
    {
        "widgetGrossProfitCard": [
            {
                "salesamount": 0,
                "purchaseamount": 0,
                "grossprofit": 0
            }
        ]
    },
    {
        "salesTodayCard": [
            {
                "total": 0
            }
        ]
    },
    {
        "saleCard": [
            {
                "sale_price": 0
            }
        ]
    },
    {
        "unReconciliateCard": [
            {
                "DATE": "14/06/2024",
                "amount": 0
            }
        ]
    },
    {
        "pieCard": [
            {
                "data": []
            }
        ]
    },
    {
        "areaCard": [
            {
                "data": []
            }
        ]
    },
    {
        "profitCard": [
            {
                "day": [],
                "week": [],
                "month": [],
                "year": []
            }
        ]
    },
    {
        "totalPayableReceivableCard": [
            {
                "receivableAging": [
                    0,0,0,0,0
                ],
                "payableAging": [
                    0,0,0,0,0
                ]
            }
        ]
    },
    {
        "linechartCard": []
    },
    {
        "stockSummaryCard": [
            {
                "data": []
            }
        ]
    },
    {
        "receivablesCard": [
            {
                "employee_id": 333,
                "company_id": 142,
                "receivablesDueRecord": 0
            }
        ]
    },
    {
        "payableCard": [
            {
                "payablesDueRecord": 0
            }
        ]
    },
    {
        "totalReceivableCard": [
            {
                "totalReceivable": [
                    {
                        "receivablesDueRecord": 0,
                        "receivablesTotal": 0,
                        "overDueAmount": 0
                    }
                ],
                "receivableAging": [
                    0,0,0,0,0
                ]
            }
        ]
    },
    {
        "totalPayableCard": [
            {
                "totalPayable": [
                    {
                        "payablesDueRecord": 0,
                        "payablesTotal": 0,
                        "overDueAmount": 0
                    }
                ],
                "receivableAging": [
                    0,0,0,0,0
                ]
            }
        ]
    },
    {
        "locateStockCard": [
            {
                "data": []
            }
        ]
    },
    {
        "todaySalesCard": [
            {
                "lastTenDaysSales": [],
                "tillDateSales": {
                    "total": 0
                },
                "todaySale": {
                    "total": 0
                }
            }
        ]
    },
    {
        "cashFlowCard": [
            {
                "openingBalance": 0,
                "closingBalance": 0,
                "outgoing": 0,
                "incoming": 0,
                "graphData": []
            }
        ]
    },
    {
        "brandSalesCard": [
            {
                "data": []
            }
        ]
    },
    {
        "areaWiseSaleCard": [
            {
                "data": []
            }
        ]
    },
    {
        "salesComparisonCard": [
            {
                "data": {
                    "currentMonth": [],
                    "lastMonth": []
                }
            }
        ]
    },
    {
        "totalSalesCard": [
            {
                "data": []
            }
        ]
    },
    {
        "breakDownCard": []
    },
    {
        "widgetTopSalesCard": [
            {
                "totalSale": 0,
                "billedCount": 0,
                "unBilledCount": 0,
                "topSale": []
            }
        ]
    },
    {
        "nonmoveCategoryCard": [
            {
                "data": []
            }
        ]
    },
    {
        "posSummaryCard": []
    },
    {
        "ChequeBounces": [
            {
                "data": []
            }
        ]
    },
    {
        "visitsReportCard": [
            {
                "data": []
            }
        ]
    },
    {
        "companyLoanDue": []
    }
]

const salesDashboard = [
    {
        "expenseCard": [
            {
                "monthtotal": 0,
                "PreMonthTotal": 0
            }
        ]
    },
    {
        "spendingCard": [
            {
                "ledger_id": null,
                "name": null,
                "amount": 0
            }
        ]
    },
    {
        "salesTodayCard": [
            {
                "total": 0
            }
        ]
    },
    {
        "availStockCard": [
            {
                "grandTotal": 0
            }
        ]
    },
    {
        "currentSaleCard": [
            {
                "totalSale": 0
            }
        ]
    },
    {
        "customerBilledCard": [
            {
                "billedCount": 0
            }
        ]
    },
    {
        "customerUnBilledCard": [
            {
                "UnbilledCount": 0
            }
        ]
    },
    {
        "TotalOutstanding": [
            {
                "total_outstanding": 0
            }
        ]
    },
    {
        "OverDue": [
            {
                "total_outstanding": 0
            }
        ]
    },
    {
        "cashInHandCard": [
            {
                "closing_balance": 0
            }
        ]
    },
    {
        "bankBalanceCard": [
            {
                "amount": 0
            }
        ]
    },
    {
        "roiCard": [
            {
                "roi": 0
            }
        ]
    },
    {
        "netProfitCard": [
            {
                "salesamount": 0,
                "purchaseamount": 0,
                "indirectexpenses": 0,
                "netprofit": 0
            }
        ]
    },
    {
        "CollectToday": [
            {
                "to_be_collected_today": null,
                "total": null,
                "received_amount": null
            }
        ]
    },
    {
        "CollectOverDue": [
            {
                "totalOverDue": null,
                "total": null,
                "received_amount": null
            }
        ]
    },
    {
        "CollectStatus": [
            {
                "total_outstanding": null,
                "total": null,
                "received_amount": null
            }
        ]
    },
    {
        "widgetGrossProfitCard": [
            {
                "salesamount": 0,
                "purchaseamount": 0,
                "grossprofit": 0
            }
        ]
    },
    {
        "saleCard": [
            {
                "sale_price": 0
            }
        ]
    },
    {
        "pieCard": [
            {
                "data": []
            }
        ]
    },
    {
        "widgetTopSalesCard": [
            {
                "totalSale": 0,
                "billedCount": 0,
                "unBilledCount": 0,
                "topSale": []
            }
        ]
    },
    {
        "totalPayableReceivableCard": [
            {
                "receivableAging": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "payableAging": [
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            }
        ]
    },
    {
        "areaCard": [
            {
                "data": []
            }
        ]
    },
    {
        "salesComparisonCard": [
            {
                "data": {
                    "currentMonth": [],
                    "lastMonth": []
                }
            }
        ]
    },
    {
        "stockSummaryCard": [
            {
                "data": []
            }
        ]
    },
    {
        "brandSalesCard": [
            {
                "data": []
            }
        ]
    },
    {
        "TopTenOutstanding": [
            {
                "data": []
            }
        ]
    },
    {
        "linechartCard": []
    },
    {
        "cashFlowCard": [
            {
                "openingBalance": 0,
                "closingBalance": 0,
                "outgoing": 0,
                "incoming": 0,
                "graphData": []
            }
        ]
    },
    {
        "todaySalesCard": [
            {
                "lastTenDaysSales": [],
                "tillDateSales": {
                    "total": 0
                },
                "todaySale": {
                    "total": 0
                }
            }
        ]
    },
    {
        "visitsReportCard": [
            {
                "data": []
            }
        ]
    },
    {
        "companyLoanDue": []
    }
]

const asssetsDashboard = [
    {
        "noOfAssets": [
            {
                "totalAssets": 0
            }
        ]
    },
    {
        "totalAssetValue": [
            {
                "totalCost": 0
            }
        ]
    },
    {
        "totalFascalYear": [
            {
                "totalCost": 0
            }
        ]
    },
    {
        "assignedCount": [
            {
                "count": 0
            }
        ]
    },
    {
        "unAssigned": [
            {
                "count": 0
            }
        ]
    },
    {
        "auditCount": [
            {
                "count": 0
            }
        ]
    },
    {
        "UnAudited": [
            {
                "unAudited": 0
            }
        ]
    },
    {
        "insuranceRenewalCount": [
            {
                "count": 0
            }
        ]
    },
    {
        "warrantyExpired": [
            {
                "expired": 0
            }
        ]
    },
    {
        "serviceDueCount": [
            {
                "count": 0
            }
        ]
    },
    {
        "assetLocation": []
    },
    {
        "assetStatus": []
    },
    {
        "assetCondition": []
    },
    {
        "assetTypeCount": []
    },
    {
        "topAssetsByValue": []
    },
    {
        "pendingAudits": []
    }
]

const leadsDashboard = [
    {
        "totalLeads": [
            {
                "totalLeads": 0
            }
        ]
    },
    {
        "totalLeadsValue": [
            {
                "totalValue": 0
            }
        ]
    },
    {
        "convertedLeadsCount": [
            {
                "convertedLeadsCount": 0
            }
        ]
    },
    {
        "convertedLeadsValue": [
            {
                "convertedLeadsValue": 0
            }
        ]
    },
    {
        "openNotContactedCount": [
            {
                "openNotContactedLeadsCount": 0
            }
        ]
    },
    {
        "workingContactedCount": []
    },
    {
        "closedNotConvertedCount": []
    },
    {
        "leadsBySource": []
    },
    {
        "customerGrowth": []
    },
    {
        "approxValueBySource": []
    },
    {
        "leadsComparision": []
    },
    {
        "leadsPipeline": []
    },
    {
        "convertedLeadsAndValues": []
    },
    {
        "salesLeads": []
    },
    {
        "leadsDailyReport": []
    },
    {
        "todaysLeads": []
    },
    {
        "myOpenTasks" : [{
            "myOpenTasks": []
        }]
    },
    {
        "myMeetings": [{
            myMeetings: []
        }]
    }
]

const projectDashboard = [
    {
        "WorkLoad": [
            {
                "data": []
            }
        ]
    },
    {
        "TaskCreatedAndResolved": [
            {
                "createTask": [],
                "resolvedTask": [],
                "taskCount": 0
            }
        ]
    },
    {
        "WorkLogCard": [
            {
                "data": []
            }
        ]
    },
    {
        "LogReportCard": [
            {
                "data": []
            }
        ]
    }
]

const storage = getsessionStorage()


export const staticDashboardData =
  storage.role_name === 'Employee' && storage.company_type === 5
    ? employeePayrollDashboard
    : storage.company_type === 5
    ? adminPayrollDashboard
    : storage.company_type === 2
    ? POSdashboard
    : storage.company_type === 3
    ? salesDashboard
    : storage.company_type === 9
    ? asssetsDashboard
    : storage.company_type === 10
    ? leadsDashboard
    : storage.company_type === 11
    ? projectDashboard
    : [];

// module.export = {adminDashboard}