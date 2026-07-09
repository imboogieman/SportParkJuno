import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { translations } from '../i18n';

export function TermsModal({ 
  isOpen, 
  onClose, 
  lang = 'EN' 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  lang?: string 
}) {
  const t = translations[lang as keyof typeof translations] || translations.EN;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[40px] p-8 md:p-12 shadow-3xl border border-white/20 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="mb-8 pr-12 relative">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-navy leading-tight">
                {t.agreementTitle}
              </h3>
              <button 
                onClick={onClose}
                className="absolute top-0 right-0 w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy/40 hover:bg-brand-navy/10 transition-all font-sans z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar font-sans">
               <div className="space-y-6 text-brand-navy/70 text-sm font-medium leading-relaxed italic">
                  <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementDate}</p>
                  <p className="text-brand-navy text-lg font-black uppercase italic tracking-tighter leading-tight bg-brand-teal/5 p-4 rounded-2xl border border-brand-teal/10">
                    {t.agreementSub}
                  </p>
                  
                  <div className="space-y-8">
                    {/* Section 1 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS1}</p>
                      <p>{t.agreementS1_1}</p>
                      <p>{t.agreementS1_2}</p>
                      <p>{t.agreementS1_3}</p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS2}</p>
                      <p>{t.agreementS2_1}</p>
                      <p>{t.agreementS2_2}</p>
                      <p>{t.agreementS2_3}</p>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS3}</p>
                      <p>{t.agreementS3_1}</p>
                      <p>{t.agreementS3_2}</p>
                      <p>{t.agreementS3_3}</p>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS4}</p>
                      <p>{t.agreementS4_1}</p>
                      <p>{t.agreementS4_2}</p>
                      <p>{t.agreementS4_3}</p>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS5}</p>
                      <p>{t.agreementS5_1}</p>
                      <p>{t.agreementS5_2}</p>
                      <p>{t.agreementS5_3}</p>
                    </div>

                    {/* Section 6 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS6}</p>
                      <p>{t.agreementS6_1}</p>
                      <p>{t.agreementS6_2}</p>
                    </div>

                    {/* Section 7 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS7}</p>
                      <p>{t.agreementS7_1}</p>
                      <p>{t.agreementS7_2}</p>
                    </div>

                    {/* Section 8 */}
                    <div className="space-y-2">
                      <p className="font-black text-brand-navy uppercase tracking-widest text-[10px]">{t.agreementS8}</p>
                      <p className="p-4 bg-brand-navy/5 rounded-2xl border border-brand-navy/5 font-black uppercase text-[10px] tracking-widest leading-loose">
                        {t.agreementS8_info}
                      </p>
                    </div>
                  </div>

                  <p className="text-center text-[10px] opacity-30 mt-12 pb-12">End of document / Конец документа</p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
