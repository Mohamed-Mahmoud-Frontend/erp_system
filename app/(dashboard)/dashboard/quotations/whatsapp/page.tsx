import {requirePermission} from '@/lib/access';
import PageForm from './client-page';
export default async function Page(){await requirePermission('sales');return <PageForm/>;}
