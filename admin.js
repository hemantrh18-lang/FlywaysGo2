/* Admin panel: create an Auth user in Supabase, then sign in here. */
(() => {
  const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL";
  const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY";
  const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_");
  const db = configured && window.supabase ? window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY) : null;
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const loginCard=$("#loginCard"), dashboard=$("#dashboard");
  if(!db){$("#loginMsg").textContent="Setup required: add your Supabase project URL and anon public key in admin.js.";return;}
  $("#loginForm").addEventListener("submit",async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);
    const {error}=await db.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});
    $("#loginMsg").textContent=error?error.message:"";
    if(!error) showDashboard();
  });
  $("#logout").addEventListener("click",async()=>{await db.auth.signOut();dashboard.classList.add("hidden");loginCard.classList.remove("hidden");});
  async function showDashboard(){const {data}=await db.auth.getSession();if(!data.session)return;loginCard.classList.add("hidden");dashboard.classList.remove("hidden");loadRequests();}
  $("#refresh").addEventListener("click",loadRequests);
  $("#dealForm").addEventListener("submit",async e=>{
    e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget).entries());
    const {error}=await db.from("flight_deals").insert({origin:f.origin.trim(),destination:f.destination.trim(),airline:f.airline.trim()||null,travel_date:f.travel_date.trim()||null,indicative_fare:Number(f.indicative_fare),discount_label:f.discount_label.trim()||null,notes:f.notes.trim()||null,active:true});
    $("#dealMsg").textContent=error?error.message:"Deal published.";if(!error)e.currentTarget.reset();
  });
  async function loadRequests(){
    $("#requestsBody").innerHTML="<tr><td colspan='6'>Loading…</td></tr>";
    const {data,error}=await db.from("booking_requests").select("*").order("created_at",{ascending:false}).limit(100);
    if(error){$("#requestsBody").innerHTML=`<tr><td colspan="6">${esc(error.message)}</td></tr>`;return;}
    if(!data?.length){$("#requestsBody").innerHTML="<tr><td colspan='6'>No booking requests yet.</td></tr>";return;}
    $("#requestsBody").innerHTML=data.map(r=>`<tr><td><b>${esc(r.id.slice(0,8))}</b><br><small>${new Date(r.created_at).toLocaleString()}</small></td><td>${esc(r.customer_name)}<br>${esc(r.phone)}<br>${esc(r.email||"")}</td><td>${esc(r.origin)} → ${esc(r.destination)}<br>${esc(r.departure_date)}${r.return_date?" / "+esc(r.return_date):""}</td><td>${r.adults} adult · ${r.children} child · ${r.infants} infant</td><td><span class="status">${esc(r.status)}</span><br><small>Fare: ${r.confirmed_fare==null?"—":"₹"+Number(r.confirmed_fare).toLocaleString("en-IN")}<br>Payment: ${esc(r.payment_status||"pending")}<br>PNR: ${esc(r.pnr||"—")}</small></td><td><div class="admin-actions"><button class="secondary" data-action="status" data-id="${r.id}">Update status</button><button class="secondary" data-action="fare" data-id="${r.id}">Set fare</button><button class="secondary" data-action="ticket" data-id="${r.id}">Ticket / PNR</button></div></td></tr>`).join("");
    $("#requestsBody").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>updateRequest(b.dataset.id,b.dataset.action)));
  }
  async function updateRequest(id,action){
    let updates={};
    if(action==="status"){const v=prompt("Status: new, agent_checking, fare_confirmed, awaiting_payment, paid, ticket_issued, cancelled, refund_pending, refunded");if(!v)return;updates.status=v.trim();}
    if(action==="fare"){const v=prompt("Agent-confirmed final fare in INR (number only):");if(v===null)return;if(!Number.isFinite(Number(v))||Number(v)<=0){alert("Enter a valid amount.");return;}updates.confirmed_fare=Number(v);updates.status="fare_confirmed";}
    if(action==="ticket"){const p=prompt("PNR / booking reference (leave blank if not issued):");if(p===null)return;const t=prompt("E-ticket number (optional):");if(t===null)return;updates.pnr=p.trim()||null;updates.ticket_number=t.trim()||null;if(p.trim())updates.status="ticket_issued";}
    const {error}=await db.from("booking_requests").update(updates).eq("id",id);
    if(error)alert(error.message);else loadRequests();
  }
  db.auth.getSession().then(({data})=>{if(data.session)showDashboard();});
})();