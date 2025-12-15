import { Button, Divider, Form, message, notification, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { callSendRegisterOtp, callVerifyRegisterOtp } from 'config/api';
import styles from 'styles/auth.module.scss';
import { ArrowRightOutlined, ReloadOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const formData = (location.state as any)?.formData;

    useEffect(() => {
        if (!formData?.email) {
            notification.warning({ message: 'Thiếu thông tin đăng ký, vui lòng nhập lại' });
            navigate('/register');
        }
    }, [formData?.email]);

    const maskedEmail = useMemo(
        () => formData?.email ? formData.email.replace(/(.{2}).+(@.+)/, '$1***$2') : '',
        [formData?.email]
    );

    const handleResend = async () => {
        if (!formData?.email) return;
        setIsResending(true);
        const res = await callSendRegisterOtp(formData.email);
        setIsResending(false);
        if (res?.data) {
            message.success('Đã gửi lại OTP, vui lòng kiểm tra email');
        } else {
            notification.error({
                message: 'Gửi OTP thất bại',
                description: res?.message || 'Không gửi được OTP, thử lại sau',
                duration: 5
            });
        }
    };

    const handleChangeDigit = (value: string, idx: number) => {
        const val = value.replace(/\D/g, '').slice(-1);
        const next = [...otpDigits];
        next[idx] = val;
        setOtpDigits(next);
        if (val && inputsRef.current[idx + 1]) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        if (!pasted.length) return;
        const next = Array(6).fill('');
        pasted.forEach((d, i) => { next[i] = d; });
        setOtpDigits(next);
        const nextFocus = Math.min(pasted.length, 5);
        inputsRef.current[nextFocus]?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    const onFinish = async () => {
        if (!formData?.email) {
            notification.warning({ message: 'Thiếu thông tin đăng ký, vui lòng nhập lại' });
            navigate('/register');
            return;
        }
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            notification.warning({ message: 'Vui lòng nhập đủ 6 số OTP' });
            return;
        }
        setIsVerifying(true);
        const res = await callVerifyRegisterOtp({
            ...formData,
            otp
        });
        setIsVerifying(false);
        if (res?.data?._id) {
            message.success('Xác thực thành công, vui lòng đăng nhập');
            navigate('/login');
        } else {
            notification.error({
                message: 'Xác thực thất bại',
                description: res?.message && Array.isArray(res?.message) ? res.message[0] : res?.message,
                duration: 5
            });
        }
    };

    return (
        <div className={styles["register-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper} style={{ maxWidth: 520, margin: '0 auto', padding: 32, borderRadius: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', background: '#fff' }}>
                        <div style={{ textAlign: 'center', marginBottom: 12 }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                <LockOutlined style={{ fontSize: 28, color: '#3b82f6' }} />
                            </div>
                            <h2 className={`${styles.text} ${styles["text-large"]}`} style={{ marginBottom: 8 }}>Xác thực OTP</h2>
                            <Typography.Text type="secondary">
                                Mã đã gửi tới <strong>{maskedEmail}</strong>. Kiểm tra inbox/spam và nhập 6 số bên dưới.
                            </Typography.Text>
                        </div>
                        <Form
                            name="verify-otp"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '20px 0 12px' }}>
                                {otpDigits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={(el) => inputsRef.current[idx] = el}
                                        value={digit}
                                        onChange={(e) => handleChangeDigit(e.target.value, idx)}
                                        onKeyDown={(e) => handleKeyDown(e, idx)}
                                        onPaste={handlePaste}
                                        maxLength={1}
                                        inputMode="numeric"
                                        pattern="\d*"
                                        style={{
                                            width: 54,
                                            height: 64,
                                            textAlign: 'center',
                                            fontSize: 24,
                                            borderRadius: 10,
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                                            outline: 'none',
                                            transition: 'all 0.15s ease',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,130,246,0.18)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                                        }}
                                    />
                                ))}
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                                    Không nhận được mã? <Button type="link" onClick={handleResend} loading={isResending} icon={<ReloadOutlined />} style={{ paddingLeft: 4 }}>Gửi lại</Button>
                                </Typography.Text>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isVerifying}
                                    icon={<ArrowRightOutlined />}
                                    style={{ minWidth: 180, height: 44, borderRadius: 999 }}
                                >
                                    Xác thực & Đăng ký
                                </Button>
                            </div>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default VerifyOtpPage;

