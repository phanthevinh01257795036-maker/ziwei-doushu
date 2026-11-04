import { STAR_DESCRIPTIONS } from "../../lib/ziwei/constants";
import { starVi } from "../../lib/report/locale";
/** Static translations of exact repository keywords, NOT personal conclusions. */
const translations: Record<string, string> = {
  紫微: "Đế vương · tôn quý · độc lập",
  天机: "Trí tuệ · ứng biến · mưu lược",
  太阳: "Dương cương · quan quý · rộng rãi",
  武曲: "Tài sản · cương nghị · quyết đoán",
  天同: "Ôn hòa · hưởng phúc · tùy duyên",
  廉贞: "Tài nghệ · hình tù · đào hoa",
  天府: "Kho tài · vững vàng · bảo thủ",
  太阴: "Mềm mại · tài sản · âm nhu",
  贪狼: "Ham muốn · đào hoa · đa tài",
  巨门: "Lời nói · thị phi · biện luận",
  天相: "Trợ tá · hành chính · ấn tín",
  天梁: "Che chở · y dược · trưởng bối",
  七杀: "Tướng tinh · quyết đoán · cô khắc",
  破军: "Khai phá · thay đổi · phá bỏ",
};
export const MAJOR_GLOSSARY = Object.entries(translations).map(
  ([star, textVi]) => ({
    star,
    nameVi: starVi(star),
    original: STAR_DESCRIPTIONS[star].keywords,
    textVi,
  }),
);
export const MAJOR_GLOSSARY_NOTE =
  "Đây là bản dịch từ khóa trong STAR_DESCRIPTIONS của mã nguồn MIT, không phải nguyên văn cổ thư đã hiệu đính và không phải kết luận về con người. “Đào hoa”, “cô khắc”, “hình tù” là nhãn biểu tượng truyền thống, không xác định quan hệ, hình phạt hay sự kiện thực tế. Không dùng ngũ hành sao để chẩn đoán bệnh.";
export const MAJOR_GLOSSARY_SOURCE =
  "https://github.com/Renhuai123/ziwei-doushu/blob/a600484a49255039d0725f1ba9e11ca81a948f97/lib/ziwei/constants.ts";
