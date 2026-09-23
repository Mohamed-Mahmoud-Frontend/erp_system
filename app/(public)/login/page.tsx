import type { Metadata } from 'next';
import LoginForm from './login-form';
import UiIcon from '../../(dashboard)/ui-icon';
import BrandLogo from '../../(dashboard)/brand-logo';
import '../../(dashboard)/brand.css';
import TankScene from '../../tank-scene';
export const metadata: Metadata = {title:'تسجيل الدخول',robots:{index:false,follow:false},icons:{icon:'/LOGOMOMAYAZ.png'}};
export default function LoginPage() {
  return <div className="login-page momayaz-login">
    <section className="login-story">
      <div className="login-brand"><BrandLogo eager /></div>
      <div><p className="eyebrow">مساحة واحدة. رؤية أوضح.</p><h1>إدارة منظّمة.<br/>لشغل يكبر كل يوم.</h1><p>تابع المبيعات والإنتاج والمخزون وفريق العمل، من مساحة عمل تجمع كل تفاصيل مصنعك.</p>
        <div className="login-features"><span><UiIcon name="box"/>متابعة المخزون</span><span><UiIcon name="file"/>إدارة المبيعات</span><span><UiIcon name="users"/>تنظيم فريق العمل</span></div>
      </div>
      <div className="login-scene"><TankScene /></div>
      <div className="login-story-footer"><span>مميز · نظام إدارة المصنع</span><span dir="ltr">SMART SOLUTIONS. BRIGHTER TOMORROW.</span></div>
    </section>
    <section className="login-form-panel"><div className="login-form-inner">
      <BrandLogo className="login-form-logo" eager /><p className="eyebrow">أهلًا بعودتك</p><h2>تسجيل الدخول</h2>
      <p className="login-description">أدخل بيانات حسابك للوصول إلى مساحة العمل.</p><LoginForm/>
      <p className="login-privacy">مساحة خاصة بفريق العمل · دخول للمستخدمين المصرح لهم</p>
    </div></section>
  </div>;
}
