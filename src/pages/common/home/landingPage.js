import { Button, Grid } from '@mui/material';
import React from 'react';
import getStartedIcon from 'assets/dashboardIcons/getstarted.svg';
import pos from 'assets/dashboardIcons/POSLogo.svg';
import Saleslogo from 'assets/dashboardIcons/Saleslogo.svg';
import PayrollLogo from 'assets/dashboardIcons/PayrollLogo.svg';
import ASSESTS from 'assets/dashboardIcons/ASSESTS.svg';
import LeadStroke from 'assets/dashboardIcons/LeadStroke.svg';
import projectslogo from 'assets/dashboardIcons/projectslogo.svg';
import { getsessionStorage } from 'pages/common/login/cookies';

export default function LandingPage({ handleStart }) {
    let storage = getsessionStorage();

    // Map company types to labels and logos
    const companyData = {
        2: { label: "POINT OF SALE", logo: pos, brief: "Simple and Effective Billing Software, Perfectly Tailored for Indian Retail Stores.", content: "Simple and Effective Billing Software, Perfectly Tailored for Indian Retail Stores." },
        3: { label: "SALES", logo: Saleslogo, brief: "Empower Your Sales Team, Boost Your Business – Smarter Sales, Simplified!", content: "Supercharge your business with our all-in-one software! Streamline sales, payments, deliveries, approvals, and manage inventory and collections effortlessly. Drive growth, boost performance, and stay ahead of the competition!" },
        5: { label: "PAYROLL", logo: PayrollLogo, brief: "Effortless Attendance and Payroll Management, Anytime, Anywhere.", content: "and you’re ready to experience effortless payroll and attendance management. Say goodbye to the hassle, and get ready to streamline everything with just a few clicks!" },
        9: { label: "ASSETS", logo: ASSESTS, brief: "Asset Control at Your Fingertips Maximize Value, Minimize Loss", content: "Asset Control at Your Fingertips Maximize Value, Minimize Loss." },
        10: { label: "LEADS", logo: LeadStroke, brief: "A Simplified Yet Powerful CRM", content: "Efficient lead management makes a big difference in reaching sales goals and building strong customer relationships." },
        11: { label: "PROJECTS", logo: projectslogo, brief: "Project Management Made Simple", content: "Streamline Projects, Improve Teamwork, Deliver Results." },
    };

    // Get the company type data
    const companyType = companyData[storage.company_type] || {};
    const { label: comTypeName, logo: companyLogo, brief: description, content: cont } = companyType;

    return (
        <div style={{ margin: '20px' }}>
            <Grid container>
                <Grid
                    height={'30%'}
                    width={'70%'}
                    size={{
                        lg: 6,
                        md: 6,
                        sm: 12,
                        xs: 12
                    }}>
                    <img src={getStartedIcon} alt="Get Started Icon" />
                </Grid>
                <Grid
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                    size={{
                        lg: 6,
                        md: 6,
                        sm: 12,
                        xs: 12
                    }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1>
                            Welcome to Tazk {comTypeName}
                            {companyLogo && <img src={companyLogo} alt={`${comTypeName} Logo`} height={50} width={50} style={{ marginLeft: '10px' }} />}
                        </h1>
                        <h4>{description}</h4>
                        <h4>
                            We’re excited to have you onboard!{" "}
                            {storage?.subscription_type === 1
                                ? "You have successfully registered"
                                : "Your 14-day free trial is live"}
                            , {cont}
                        </h4>
                        <h2>Let’s get started now!</h2>
                        <div style={{ display: 'flex', justifyContent : 'center'}}>
                            <Button onClick={handleStart} variant='contained' style={{ height: '50px', width: '100px' }}>
                                START
                            </Button>
                        </div>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}
