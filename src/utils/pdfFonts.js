import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

// Factory Method pattern
class StudentExamPdfExporter {
  export(exam) {
    const answerLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    const docDefinition = {
      content: [
        {
          columns: [
            {
              stack: [
                { text: 'TRƯỜNG THPT CHUYÊN AI', style: 'school' },
                { text: 'ĐỀ KIỂM TRA CUỐI KỲ I', style: 'examType' }
              ],
              width: '*'
            },
            {
              text: `Mã đề: ${exam.examId?.slice(-4) || '----'}`,
              alignment: 'right',
              style: 'examCode',
              width: 'auto'
            }
          ],
          margin: [0, 0, 0, 4]
        },

        { text: 'ĐỀ THI KIỂM TRA MÔN VẬT LÝ', style: 'title', margin: [0, 4, 0, 4] },
        { text: exam.examName, style: 'examName', margin: [0, 0, 0, 8] },

        {
          columns: [
            { text: 'Môn thi: VẬT LÝ', style: 'infoLabel', width: '33%' },
            { text: 'Lớp: 10', style: 'infoLabel', width: '33%' },
            {
              text: `Thời gian: ${exam.durationMinutes} phút`,
              alignment: 'right',
              width: '34%',
              style: 'infoLabel'
            }
          ],
          margin: [0, 0, 0, 4]
        },
        {
          text: `Ngày thi: ${new Date().toLocaleDateString('vi-VN')}`,
          style: 'infoText',
          margin: [0, 0, 0, 8]
        },
        {
          text: 'Họ và tên học sinh: .....................................................   SBD: ............',
          margin: [0, 0, 0, 16],
          style: 'infoText'
        },

        ...exam.questions.flatMap((q, idx) => {
          const answerChoices = q.question.answerChoices || [];
          return [
            {
              text: `${idx + 1}. ${q.question.questionText}`,
              style: 'question',
              margin: [0, 6, 0, 2]
            },
            {
              ol: answerChoices.map((ans, i) =>
                `${answerLabels[i] || ''}. ${ans.choiceText || ans.content || ''}`
              ),
              margin: [16, 0, 0, 8],
              style: 'answers'
            },
            { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 0.3, lineColor: '#ccc' } ] }
          ];
        }),

        { text: '\n\n', pageBreak: 'after' },
        {
          columns: [
            { text: 'Giám thị 1\n\n\n\n(Ký, ghi rõ họ tên)', alignment: 'center' },
            { text: 'Giám thị 2\n\n\n\n(Ký, ghi rõ họ tên)', alignment: 'center' },
            { text: 'Thí sinh\n\n\n\n(Ký, ghi rõ họ tên)', alignment: 'center' }
          ],
          margin: [0, 32, 0, 0],
          style: 'footer'
        }
      ],

      styles: {
        school: { fontSize: 13, bold: true, alignment: 'left' },
        examType: { fontSize: 13, italics: true },
        examCode: { fontSize: 12, bold: true },
        title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 8, 0, 8] },
        examName: { fontSize: 14, bold: true, alignment: 'center' },
        infoLabel: { fontSize: 12, bold: true },
        infoText: { fontSize: 12 },
        question: { fontSize: 12, bold: true },
        answers: { fontSize: 12, margin: [12, 0, 0, 0] },
        footer: { fontSize: 11, italics: true }
      },

      defaultStyle: {
        font: 'Roboto'
      }
    };

    pdfMake.createPdf(docDefinition).download(`${exam.examName || 'De-thi'}.pdf`);
  }
}

export function getPdfExporter(type) {
  switch (type) {
    case 'student':
    default:
      return new StudentExamPdfExporter();
  }
}

export default pdfMake;
