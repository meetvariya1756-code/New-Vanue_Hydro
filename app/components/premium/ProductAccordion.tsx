import { Disclosure } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from '@remix-run/react';
import clsx from 'clsx';

export function ProductAccordion({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure as="div" className="border-b border-black/10 py-4">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full items-center justify-between bg-transparent text-left focus:outline-none">
            <span className="font-serif text-lg tracking-wide text-black/90">
              {title}
            </span>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-5 w-5 text-black/50" />
            </motion.div>
          </Disclosure.Button>

          <AnimatePresence>
            {open && (
              <Disclosure.Panel
                static
                as={motion.div}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pb-4 pt-4">
                  <div
                    className="prose prose-sm font-sans text-sm leading-relaxed text-black/70"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                  {learnMore && (
                    <Link
                      to={learnMore}
                      className="mt-4 inline-block font-sans text-xs font-semibold uppercase tracking-widest text-black/90 transition-colors hover:text-black/60"
                    >
                      Learn more &rarr;
                    </Link>
                  )}
                </div>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}
