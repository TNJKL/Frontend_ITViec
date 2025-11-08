import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import NotPermitted from "./not-permitted";
import Loading from "../loading";

const RoleBaseRoute = (props: any) => {
    const user = useAppSelector(state => state.account.user);
    const userRole = user?.role?.name;

    if (!userRole || userRole !== 'NORMAL_USER') {
        return (<>{props.children}</>)
    } else {
        return (<NotPermitted />)
    }
}

interface IProtectedRouteProps {
    children: React.ReactNode;
    allowNormalUser?: boolean; // Cho phép NORMAL_USER truy cập (dùng cho account management)
}

const ProtectedRoute = (props: IProtectedRouteProps) => {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated)
    const isLoading = useAppSelector(state => state.account.isLoading)
    const { allowNormalUser = false } = props;

    return (
        <>
            {isLoading === true ?
                <Loading />
                :
                <>
                    {isAuthenticated === true ?
                        <>
                            {allowNormalUser ? (
                                <>{props.children}</>
                            ) : (
                                <RoleBaseRoute>
                                    {props.children}
                                </RoleBaseRoute>
                            )}
                        </>
                        :
                        <Navigate to='/login' replace />
                    }
                </>
            }
        </>
    )
}

export default ProtectedRoute;