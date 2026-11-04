import approvedSnapshots from "./review-snapshots.json";
import type { Rule } from "../../lib/report/types";
export type ContentReview = {
  status: "approved" | "hold";
  basis: "structural" | "excerpt" | "pending";
  note: string;
  version: "semantic-review-1";
  independentReview: false;
};
type Entry = {
  status: ContentReview["status"];
  basis: ContentReview["basis"];
  note: string;
  textVi?: string;
};
/** Manual editorial review of all 30 current rules. This is not independent scholarly certification. */
export const CONTENT_REVIEW: Record<string, Entry> = {
  "ming-empty": {
    status: "approved",
    basis: "structural",
    note: "Chỉ giải thích Mệnh không có chính tinh và không chuyển sao; không suy phú quý hoặc xuất thân.",
  },
  "ming-lian-tan": {
    status: "hold",
    basis: "pending",
    note: "Trích đoạn chỉ ghi hai sao đồng độ, không chứng minh toàn bộ ý tài nghệ/sức hút; thiếu ngữ cảnh và điều kiện miếu/hãm.",
  },
  "ming-qu": {
    status: "approved",
    basis: "excerpt",
    note: "Giới hạn bản Việt ở khoa giáp; giữ điều kiện Văn Xương và gặp cát tinh cho vế khoa đệ.",
    textVi:
      "Văn Khúc thực tại Mệnh. Mẩu nguồn gọi Văn Khúc là sao chủ khoa giáp; vế nói về đỗ đạt còn đòi đi cùng Văn Xương và gặp cát tinh. Báo cáo không từ một Văn Khúc đơn lẻ kết luận tài nghệ hay thành tích thi cử.",
  },
  "ming-chang": {
    status: "hold",
    basis: "pending",
    note: "Cụm Văn Xương chủ khoa giáp quá ngắn, thiếu bản trích có ngữ cảnh và chưa hỗ trợ đầy đủ lời khuyên viết/trình bày.",
  },
  "career-fu": {
    status: "hold",
    basis: "pending",
    note: "Nguồn có điều kiện nhập miếu và không sát/hao; bản Việt suy vai trò tổ chức/giữ công việc chưa được mẩu trích hỗ trợ trực tiếp.",
  },
  "career-fu-strong-qs": {
    status: "hold",
    basis: "pending",
    note: "Chưa giải quyết nhập miếu có bao gồm vượng không; phạm vi không có sát/hao là đồng cung hay hội chiếu chưa rõ; không tự mở rộng thành điều kiện đã xác nhận.",
  },
  "career-chang": {
    status: "hold",
    basis: "pending",
    note: "Nguồn chứa các điều kiện miếu, Thái Dương, cát tinh và Khoa/Quyền/Lộc; chỉ kiểm Văn Xương tại Quan Lộc chưa đủ để áp các vế luận.",
  },
  "career-fu-chang": {
    status: "approved",
    basis: "excerpt",
    note: "Chỉ trình bày ý tổ hợp được đoạn văn v4.0 ghi trực tiếp, không gán thành trích cổ thư hoặc dự báo.",
    textVi:
      "Thiên Phủ và Văn Xương thực đồng cung Quan Lộc. Đoạn biên soạn v4.0 mô tả tổ hợp này bằng hai ý: quản lý tài chính và học thức. Đây là cách diễn giải của dữ liệu v4.0, không phải bằng chứng bạn có sẵn năng lực đó, và không xác định nghề, thu nhập hay chức vụ.",
  },
  "wealth-xiang": {
    status: "approved",
    basis: "excerpt",
    note: "Dịch đúng vế Thiên Tướng phú túc; không áp vế đồng Tử Vi hoặc thêm lời khuyên tài chính thành ý nguồn.",
    textVi:
      "Thiên Tướng thực tại Tài Bạch. Mẩu nguồn dùng chữ “富足”, nghĩa là đủ đầy. Vế tiếp theo nói về tài khí tăng mạnh có điều kiện đồng cung Tử Vi; chỉ có Thiên Tướng không đủ để áp vế đó. Đây là biểu đạt truyền thống, không bảo đảm mức tài sản hoặc lợi nhuận.",
  },
  "wealth-wu": {
    status: "hold",
    basis: "pending",
    note: "Cụm Vũ Khúc tài tinh chỉ là nhãn sao; không đủ suy năng lực kiếm/quản lý tiền tại Tài Bạch.",
  },
  "love-wu": {
    status: "hold",
    basis: "pending",
    note: "Chưa hình thức hóa ngữ cảnh bối khắc, vế đồng tuổi và ngoại lệ; lời khuyên quản lý đời sống không phải bản dịch của trích đoạn.",
  },
  "love-qi": {
    status: "hold",
    basis: "pending",
    note: "Bản Việt làm mềm lời nguồn nhưng chưa giải nghĩa đủ các điều kiện sớm khắc/đồng Vũ Khúc/cưới muộn; không đồng nhất kiểm vị trí với kiểm toàn nghĩa.",
  },
  "love-wu-qi": {
    status: "hold",
    basis: "pending",
    note: "Tổ hợp thực đúng nhưng các gợi ý kỳ vọng/tiền bạc không nằm trong đoạn trích; chưa có bản dịch và nguồn đầy đủ được duyệt.",
  },
  "parents-ji": {
    status: "hold",
    basis: "pending",
    note: "Trích đoạn phân miếu/hãm và nhóm sát tinh; bản Việt về trao đổi/tri thức chưa có căn cứ trực tiếp từ trích đoạn này.",
  },
  "siblings-sun": {
    status: "hold",
    basis: "pending",
    note: "Trích đoạn hiện ghép/lược nhiều vế không liên tục; cần bản nguyên đoạn và điều kiện miếu/hãm, không dùng số người hoặc sinh tử.",
  },
  "children-tong": {
    status: "hold",
    basis: "pending",
    note: "Câu v4.0 là mô tả tự do, chưa kiểm các điều kiện Thiên Đồng/Thiên Lương và phụ sát; lời khuyên nuôi dạy thêm ngoài đoạn trích.",
  },
  "friends-yin": {
    status: "hold",
    basis: "pending",
    note: "Câu phụ thuộc miếu/hãm và nhóm sát; điều kiện hiện chỉ xét Thái Âm, lời khuyên hợp tác chưa phải bản dịch của nguồn.",
  },
  "move-lian": {
    status: "approved",
    basis: "excerpt",
    note: "Chỉ đọc vế trích; không bảo đảm ngoại xuất tốt hoặc suy sinh tử.",
    textVi:
      "Liêm Trinh thực tại Thiên Di. Đoạn nguồn ghi “ra ngoài thông đạt, gần người quý, ít ngày ở nhà”. Đây là một vế của tài liệu truyền thống, chưa phải kết luận tổng hợp khi xét thêm sao và vận hạn; không được coi là bảo đảm đi xa sẽ thuận hoặc dự báo tai nạn.",
  },
  "move-ma": {
    status: "hold",
    basis: "pending",
    note: "Mẩu nguồn nói điều kiện thích hội Lộc Tồn/kỵ Không Vong; quy tắc chưa kiểm các điều kiện này hoặc phân biệt Không Vong cụ thể.",
  },
  "home-empty": {
    status: "approved",
    basis: "structural",
    note: "Chú giải dữ kiện vô chính diệu; không áp Thiên Đồng thực tọa bằng cách mượn sao.",
  },
  "home-tong": {
    status: "approved",
    basis: "excerpt",
    note: "Giới hạn ở mẩu trích trực tiếp và nhấn mạnh chưa tổng hợp các vế khác.",
    textVi:
      "Thiên Đồng thực tại Điền Trạch. Mẩu nguồn mô tả “trước ít sau nhiều, tự tạo lập khá vượng”. Báo cáo chỉ dẫn ý của vế này; chưa xét đầy đủ các vế về sao đồng cung và sát tinh nên không dự báo số nhà, thời điểm mua nhà hoặc khả năng giữ tài sản.",
  },
  "spirit-zi": {
    status: "hold",
    basis: "pending",
    note: "Nguồn phúc hậu/an lạc không hỗ trợ trực tiếp suy nhu cầu được công nhận; phải xử lý riêng điều kiện đồng Phá Quân và các vế khác.",
  },
  "spirit-zi-po": {
    status: "approved",
    basis: "excerpt",
    note: "Giữ hai trích đoạn riêng do v4.0 dẫn, không ghép thành một nguyên văn liên tục hoặc tự phân xử.",
    textVi:
      "Tử Vi và Phá Quân thực đồng cung Phúc Đức. Dữ liệu v4.0 dẫn hai vế khác nhau: mục Tử Vi ghi cùng Phá Quân thì lao tâm, mục Phá Quân ghi cùng Tử Vi thì an lạc. Chưa đối chiếu độc lập bản cổ và chưa có điều kiện phân xử; báo cáo chỉ ghi nhận bất đồng, không chọn một vế để dự báo bạn an nhàn hay vất vả.",
  },
  "health-ju": {
    status: "approved",
    basis: "structural",
    note: "Chỉ xác nhận Cự Môn tại Tật Ách và giới hạn chẩn đoán; không xuất lời bệnh như kết luận.",
  },
  "career-ming-qu": {
    status: "approved",
    basis: "structural",
    note: "Chỉ liên kết vị trí thật của Văn Khúc với tam hợp Quan Lộc, không cộng ý nghĩa thành dự báo.",
  },
  "reference-four-hua": {
    status: "approved",
    basis: "structural",
    note: "Chú giải chung, không đưa thành kết luận cá nhân.",
  },
  "hua-天机-父母": {
    status: "hold",
    basis: "pending",
    note: "Chỉ ghi tên sao Hóa Lộc không chứng minh hỗ trợ trưởng bối, nghề hoặc tiền; cần đoạn nguồn và điều kiện đủ.",
  },
  "hua-天梁-子女": {
    status: "hold",
    basis: "pending",
    note: "Tên Thiên Lương Hóa Quyền không tự chứng minh nội dung về kiến thức/hướng dẫn tại Tử Tức.",
  },
  "hua-紫微-福德": {
    status: "hold",
    basis: "pending",
    note: "Tên Tử Vi Hóa Khoa không phải trích đoạn đủ cho lời luận danh tiếng/học thức tại Phúc Đức.",
  },
  "hua-太阴-仆役": {
    status: "hold",
    basis: "pending",
    note: "Tên Thái Âm Hóa Kỵ chưa đủ cho các suy luận và lời khuyên cam kết trong Nô Bộc; cần điều kiện miếu/hãm và nguồn đầy đủ.",
  },
};
export function applyContentReview(rule: Rule): Rule {
  const entry = CONTENT_REVIEW[rule.id];
  const review: ContentReview = entry
    ? {
        status: entry.status,
        basis: entry.basis,
        note: entry.note,
        version: "semantic-review-1",
        independentReview: false,
      }
    : {
        status: "hold",
        basis: "pending",
        note: "Chưa có biên bản duyệt nội dung cho ID này.",
        version: "semantic-review-1",
        independentReview: false,
      };
  return {
    ...rule,
    textVi: entry?.textVi ?? rule.textVi,
    contentReview: review,
  };
}

// Approval is bound to exact text, source, scope and predicates, not merely a rule ID.
export function reviewSnapshot(rule: Rule): string {
  return JSON.stringify({
    id: rule.id,
    topic: rule.topic,
    kind: rule.kind,
    palaces: rule.palaces,
    stars: rule.stars,
    source: {
      title: rule.source.title,
      locator: rule.source.locator,
      original: rule.source.original,
      license: rule.source.license,
      url: rule.source.url,
    },
    school: rule.school,
    conditions: rule.conditions,
    exclude: rule.exclude,
    textVi: rule.textVi,
    concept: rule.concept,
    priority: rule.priority,
    tone: rule.tone,
    conflictGroup: rule.conflictGroup ?? null,
    note: rule.note ?? null,
  });
}

export function contentReviewMatches(rule: Rule): boolean {
  return (
    rule.contentReview?.status === "approved" &&
    (approvedSnapshots as Record<string, string>)[rule.id] ===
      reviewSnapshot(rule)
  );
}
