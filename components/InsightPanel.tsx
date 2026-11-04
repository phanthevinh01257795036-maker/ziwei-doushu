'use client';
import type {ZiweiChart,Palace} from '../lib/ziwei/types';
import type {TimeView} from './TimeNav';
import {starVi,palaceVi,BRANCHES_VI} from '../lib/report/locale';
export default function InsightPanel({chart,selectedPalace}:{chart:ZiweiChart;selectedPalace?:Palace|null;selectedSiHua?:{starName:string;siHua:string;view:TimeView}|null}) {
 const p=selectedPalace??chart.palaces.find(p=>p.isMingGong)!;
 return <aside style={{padding:24,border:'1px solid #b39354',borderRadius:12}}><h2>{palaceVi(p.name)} · {BRANCHES_VI[p.branch]}</h2><p>{p.isEmpty?'Vô chính diệu. Sao mượn đối cung không tọa thủ tại đây.':'Các sao thực ở cung:'}</p><ul>{p.stars.map(s=><li key={s.name}>{starVi(s.name)} ({s.name})</li>)}</ul><p>Trang cũ giữ sơ đồ và thao tác chọn cung. Luồng báo cáo tiếng Việt kiểm tra điều kiện nằm ở trang chính.</p><a href="/">Mở công cụ lập báo cáo tiếng Việt →</a></aside>;
}
