import './config/dayjs';
import { useEffect, useRef, useState } from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import Loading from 'components/share/loading';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import Header from 'components/client/header.client';
import Footer from 'components/client/footer.client';
import HomePage from 'pages/home';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import CompanyPage from './pages/admin/company';
import PermissionPage from './pages/admin/permission';
import ResumePage from './pages/admin/resume';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import AdminServicePackagePage from './pages/admin/service-package';
import InterviewListPage from './pages/hr/InterviewList';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import JobPage from './pages/admin/job';
import ViewUpsertJob from './components/admin/job/upsert.job';
import ClientJobPage from './pages/job';
import ClientJobSearchPage from './pages/job/search';
import ClientJobDetailPage from './pages/job/detail';
import ClientCompanyPage from './pages/company';
import ClientCompanyDetailPage from './pages/company/detail';
import ManageAccountPage from './pages/account/manage';
import CVTemplatesPage from './pages/cv/templates';
import CVPreviewPage from './pages/cv/preview';
import ServicePackagePage from './pages/service-package';
import PaymentSuccessPage from './pages/payment/success';
import PaymentFailedPage from './pages/payment/failed';
import PaymentCallbackPage from './pages/payment/callback';
import MyInterviewsPage from './pages/candidate/MyInterviews';
import NotificationsPage from './pages/account/notifications';
import VerifyOtpPage from './pages/auth/verify-otp';
import EmployerRegisterPage from './pages/auth/employer-register';
import EmployerApplicationsPage from './pages/admin/employer-applications';
import ForumListPage from './pages/forum';
import ForumNewPostPage from './pages/forum/new';
import ForumPostDetailPage from './pages/forum/detail';
import AdminForumPostsPage from './pages/admin/forum-posts';
// dayjs config is imported globally via './config/dayjs'

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth' });
    }

  }, [location]);

  return (
    <div className='layout-app' ref={rootRef}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);


  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "job", element: <ClientJobPage /> },
        { path: "job/search", element: <ClientJobSearchPage /> },
        { path: "job/:id", element: <ClientJobDetailPage /> },
        { path: "company", element: <ClientCompanyPage /> },
        { path: "company/:id", element: <ClientCompanyDetailPage /> },
        { path: "cv/templates", element: <CVTemplatesPage /> },
        { path: "cv/preview", element: <ProtectedRoute allowNormalUser={true}><CVPreviewPage /></ProtectedRoute> },
        { path: "service-package", element: <ProtectedRoute allowNormalUser={true}><ServicePackagePage /></ProtectedRoute> },
        { path: "forum", element: <ForumListPage /> },
        { path: "forum/new", element: <ProtectedRoute allowNormalUser={true}><ForumNewPostPage /></ProtectedRoute> },
        { path: "forum/posts/:id", element: <ForumPostDetailPage /> },
      ],
    },

    {
      path: "/account",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { path: "manage", element: <ProtectedRoute allowNormalUser={true}><ManageAccountPage /></ProtectedRoute> },
        { path: "interviews", element: <ProtectedRoute allowNormalUser={true}><MyInterviewsPage /></ProtectedRoute> },
        { path: "interviews/:id", element: <ProtectedRoute allowNormalUser={true}><MyInterviewsPage /></ProtectedRoute> },
        { path: "notifications", element: <ProtectedRoute allowNormalUser={true}><NotificationsPage /></ProtectedRoute> }
      ]
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "company",
          element:
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },

        {
          path: "job",
          children: [
            {
              index: true,
              element: <ProtectedRoute> <JobPage /></ProtectedRoute>
            },
            {
              path: "upsert", element:
                <ProtectedRoute><ViewUpsertJob /></ProtectedRoute>
            }
          ]
        },

        {
          path: "resume",
          element:
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
        },
        {
          path: "interviews",
          element:
            <ProtectedRoute>
              <InterviewListPage />
            </ProtectedRoute>
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        },
        {
          path: "service-package",
          element:
            <ProtectedRoute>
              <AdminServicePackagePage />
            </ProtectedRoute>
        },
        {
          path: "employer-applications",
          element:
            <ProtectedRoute>
              <EmployerApplicationsPage />
            </ProtectedRoute>
        },
        {
          path: "forum-posts",
          element:
            <ProtectedRoute>
              <AdminForumPostsPage />
            </ProtectedRoute>
        }
      ],
    },


    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/employer-register",
      element: <EmployerRegisterPage />,
    },
    {
      path: "/verify-otp",
      element: <VerifyOtpPage />,
    },
    {
      path: "/payment/callback",
      element: <PaymentCallbackPage />,
    },
    {
      path: "/payment/success",
      element: <PaymentSuccessPage />,
    },
    {
      path: "/payment/failed",
      element: <PaymentFailedPage />,
    },
  ]);

  return (
    <>
      <ConfigProvider locale={viVN}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </>
  )
}