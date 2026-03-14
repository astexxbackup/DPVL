import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function RefundPolicy() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-10">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Main Heading */}
          <h1 className="font-norch text-4xl md:text-6xl text-[#3b3bb7] mb-2 uppercase text-center">
            Refund & Cancellation Policy
          </h1>
          <p className="font-roboto text-gray-500 mb-12 italic text-lg text-center">
            For Delhi Pro Volleyball League
          </p>

          <div className="font-roboto space-y-10 text-gray-700 leading-relaxed">
            {/* 1. Overview */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                1. Overview
              </h2>
              <p className="text-justify">
                This Refund and Cancellation Policy outlines the rules regarding payments made for registrations, trials, tickets, events, merchandise, or any services offered by DPVL.
              </p>
            </section>

            {/* 2. Registration & Trial Fees */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                2. Registration & Trial Fees
              </h2>
              <ul className="list-disc ml-6 space-y-2 text-justify">
                <li>All registration and trial fees are non-refundable once payment is successfully completed.</li>
                <li>Refunds will not be provided for non-selection, absence, or disqualification from trials.</li>
                <li>Participants are responsible for attending on the assigned date and time.</li>
              </ul>
            </section>

            {/* 3. Event & Match Tickets */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                3. Event & Match Tickets
              </h2>
              <ul className="list-disc ml-6 space-y-2 text-justify">
                <li>Ticket cancellations are not permitted once booked.</li>
                <li>Tickets are non-refundable, except in cases where an event or match is canceled by DPVL.</li>
                <li>If an event is canceled, refunds (if applicable) will be processed to the original payment method within a reasonable time.</li>
              </ul>
            </section>

            {/* 4. Merchandise Purchases */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                4. Merchandise Purchases
              </h2>
              <p className="mb-4 text-justify">Merchandise once sold cannot be returned or refunded unless:</p>
              <ul className="list-disc ml-6 space-y-1 text-justify">
                <li>The product is damaged, defective, or incorrect</li>
                <li>The issue is reported within 48 hours of delivery</li>
              </ul>
              <p className="mt-4 text-justify">Refunds or replacements are subject to inspection and approval by DPVL.</p>
            </section>

            {/* 5. League Cancellation or Rescheduling */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                5. League Cancellation or Rescheduling
              </h2>
              <p className="text-justify">
                In the event of league postponement, cancellation, or rescheduling due to unforeseen circumstances (weather, government orders, force majeure), DPVL shall not be liable for additional compensation beyond applicable refunds (if any).
              </p>
            </section>

            {/* 6. Payment Failures */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                6. Payment Failures
              </h2>
              <p className="text-justify">
                In case of payment failure where the amount is debited but service is not confirmed, the amount will be refunded automatically by the payment gateway as per their policy.
              </p>
            </section>

            {/* 7. Refund Processing Time */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                7. Refund Processing Time
              </h2>
              <p className="text-justify">
                Approved refunds will be processed within 7–14 business days to the original mode of payment.
              </p>
            </section>

            {/* 8. Policy Amendments */}
            <section>
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                8. Policy Amendments
              </h2>
              <p className="text-justify">
                DPVL reserves the right to modify this Refund and Cancellation Policy at any time without prior notice. Changes will be updated on the website.
              </p>
            </section>

            {/* 9. Contact for Refund Queries */}
            <section className="pt-6 border-t border-gray-100">
              <h2 className="font-roboto font-bold text-xl md:text-2xl text-gray-900 mb-4 uppercase tracking-normal">
                9. Contact for Refund Queries
              </h2>
              <p className="mb-2 text-lg text-justify">For refund or cancellation-related queries, contact us at:</p>
              <a 
                href="mailto:founder@delhiprovolleyballleague.com" 
                className="text-[#3b3bb7] font-bold text-xl hover:underline"
              >
                founder@delhiprovolleyballleague.com
              </a>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}