/* FlywaysGo customer site. Configure Supabase in this file before publishing. */
(() => {
  "use strict";
  const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL";
  const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY";
  const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_");
  const db = configured && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  const $ = s => document.querySelector(s);
  const safe = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  $("#year").textContent = new Date().getFullYear();
  const dateInput = document.querySelector('[name="departure_date"]');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0,10);
  const trip = document.querySelector('[name="trip_type"]');
  const returnDate = document.querySelector('[name="return_date"]');
  trip.addEventListener("change", () => { returnDate.required = trip.value === "Round trip"; returnDate.disabled = trip.value !== "Round trip"; });
  trip.dispatchEvent(new Event("change"));

  const demoDeals = [
    {id:"demo1",origin:"Bhopal",destination:"Delhi",airline:"Selected airline",travel_date:"Check date",indicative_fare:3499,discount_label:"Sample offer",notes:"Indicative fare only"},
    {id:"demo2",origin:"Indore",destination:"Mumbai",airline:"Selected airline",travel_date:"Check date",indicative_fare:2999,discount_label:"Sample offer",notes:"Indicative fare only"},
    {id:"demo3",origin:"Delhi",destination:"Bengaluru",airline:"Selected airline",travel_date:"Check date",indicative_fare:4999,discount_label:"Sample offer",notes:"Indicative fare only"}
  ];
  function renderDeals(rows) {
    const grid = $("#dealsGrid");
    if (!rows.length) { grid.innerHTML = '<div class="empty-state">No active deals right now. Send a booking request and we will check options.</div>'; return; }
    grid.innerHTML = rows.map(d => `<article class="deal-card"><span class="section-kicker">FLIGHT OFFER</span><div class="deal-route"><span class="city">${safe(d.origin)}</span><span class="route-line"></span><span class="city">${safe(d.destination)}</span></div><div class="deal-meta"><span>${safe(d.airline || "Airline to be confirmed")}</span><span>${safe(d.travel_date || "Date on request")}</span></div><div class="deal-price">₹${Number(d.indicative_fare || 0).toLocaleString("en-IN")} <small>/ person, indicative</small></div>${d.discount_label ? `<span class="discount">${safe(d.discount_label)}</span>` : ""}<button class="button primary" data-route="${safe(d.origin)}" data-destination="${safe(d.destination)}">Request this flight →</button><p class="muted">${safe(d.notes || "Fare and seats subject to reconfirmation.")}</p></article>`).join("");
    grid.querySelectorAll("button[data-route]").forEach(b => b.addEventListener("click", () => {
      document.querySelector('[name="origin"]').value = b.dataset.route;
      document.querySelector('[name="destination"]').value = b.dataset.destination;
      $("#booking").scrollIntoView({behavior:"smooth"});
    }));
  }
  async function loadDeals() {
    if (!db) { renderDeals(demoDeals); return; }
    const {data,error} = await db.from("flight_deals").select("*").eq("active",true).order("created_at",{ascending:false});
    if (error) { console.error(error); renderDeals([]); return; }
    renderDeals(data || []);
  }
  loadDeals();

  $("#bookingForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.currentTarget, msg = $("#bookingMessage"), button = form.querySelector("button[type=submit]");
    const f = new FormData(form), data = Object.fromEntries(f.entries());
    if (data.trip_type === "Round trip" && data.return_date < data.departure_date) { msg.textContent = "Return date must be on or after departure date."; return; }
    if (!db) { msg.textContent = "Website setup pending: connect the new Supabase project before accepting live booking requests. No details have been sent."; return; }
    button.disabled = true; button.textContent = "Sending…"; msg.textContent = "";
    const payload = {
      trip_type:data.trip_type, origin:data.origin.trim(), destination:data.destination.trim(),
      departure_date:data.departure_date, return_date:data.return_date || null,
      adults:Number(data.adults), children:Number(data.children), infants:Number(data.infants),
      customer_name:data.customer_name.trim(), phone:data.phone.trim(), email:data.email.trim() || null,
      notes:data.notes.trim() || null, consent:true, status:"new"
    };
    const {error} = await db.from("booking_requests").insert(payload);
    button.disabled = false; button.innerHTML = 'Send booking request <span>→</span>';
    if (error) { console.error(error); msg.textContent = "Request could not be sent. Please try again or contact support."; }
    else { form.reset(); trip.dispatchEvent(new Event("change")); msg.textContent = "Request received! Our team will contact you after checking fare and availability. This is not a confirmed ticket."; }
  });
})();