/* ══════════════════════════════════════════════════════
   Departure Studio — Dashboard Engine
   Shared rendering + auth logic for all client dashboards
   ══════════════════════════════════════════════════════ */

const DEPARTURE_LOGO = `<svg width="SIZE" height="SIZE" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4.8911 27.6641V5.90942H16.1623C23.8885 5.90942 28.7364 10.1513 28.7364 16.7867C28.7364 23.4222 23.8885 27.6641 16.1623 27.6641H4.8911ZM9.86013 23.3919H16.1623C20.8889 23.3919 23.6461 20.7862 23.6461 16.7867C23.6461 12.7873 20.8889 10.1816 16.132 10.1816H9.86013V23.3919Z" fill="#111111"/>
  <path d="M39.7251 5.90942H60.8132V10.2422H44.6941V14.4234H59.0861V18.6956H44.6941V23.3313H60.8132V27.6641H39.7251V5.90942Z" fill="#111111"/>
  <path d="M77.617 20.0893V27.6641H72.5571V5.90942H86.2522C91.3728 5.90942 94.7359 8.33334 94.7359 12.9994C94.7359 17.6351 91.3728 20.0893 86.2522 20.0893H77.617ZM77.617 15.8475H85.9795C88.3732 15.8475 89.7366 14.787 89.7366 12.9994C89.7366 11.2117 88.3732 10.1816 85.9795 10.1816H77.617V15.8475Z" fill="#111111"/>
  <path d="M13.799 39.2375H19.5255L30.3422 60.9922H24.8581L22.5554 56.3261H10.6176L8.31488 60.9922H2.92167L13.799 39.2375ZM16.6168 44.2066L12.6779 52.1449H20.5254L16.6168 44.2066Z" fill="#111111"/>
  <path d="M44.285 53.266V60.9922H39.2251V39.2375H53.0717C58.1316 39.2375 61.5251 41.6918 61.5251 46.2366C61.5251 49.5089 59.6769 51.7813 56.6167 52.7509L62.0402 60.9922H56.2531L51.3144 53.266H44.285ZM44.285 49.1453H52.799C55.1926 49.1453 56.5561 48.0848 56.5561 46.3275C56.5561 44.5399 55.1926 43.5097 52.799 43.5097H44.285V49.1453Z" fill="#111111"/>
  <path d="M95.2813 43.5703H85.8584V60.9922H80.7984V43.5703H71.3452V39.2375H95.2813V43.5703Z" fill="#111111"/>
  <path d="M16.2078 94.6556C8.63309 94.6556 4.87602 90.5955 4.87602 84.2933V72.5676H9.93594V83.8994C9.93594 87.7474 11.7236 90.2319 16.2078 90.2319C20.6921 90.2319 22.4494 87.7474 22.4494 83.8994V72.5676H27.5093V84.2933C27.5093 90.5955 23.7523 94.6556 16.2078 94.6556Z" fill="#111111"/>
  <path d="M44.285 86.596V94.3223H39.2251V72.5676H53.0717C58.1316 72.5676 61.5251 75.0218 61.5251 79.5667C61.5251 82.839 59.6769 85.1114 56.6167 86.081L62.0402 94.3223H56.2531L51.3144 86.596H44.285ZM44.285 82.4754H52.799C55.1926 82.4754 56.5561 81.4149 56.5561 79.6576C56.5561 77.8699 55.1926 76.8398 52.799 76.8398H44.285V82.4754Z" fill="#111111"/>
  <path d="M73.0571 72.5676H94.1452V76.9004H78.0261V81.0816H92.4181V85.3538H78.0261V89.9895H94.1452V94.3223H73.0571V72.5676Z" fill="#111111"/>
</svg>`;

function logo(size = 36) {
  return DEPARTURE_LOGO.replace(/SIZE/g, size);
}

// ── Auth ──

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function initGate(passwordHash, sessionKey) {
  const input = document.getElementById("gate-input");
  const error = document.getElementById("gate-error");

  // Check existing session
  if (sessionStorage.getItem(sessionKey) === "1") {
    showDashboard();
    return;
  }

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const hash = await hashPassword(input.value);
      if (hash === passwordHash) {
        sessionStorage.setItem(sessionKey, "1");
        showDashboard();
      } else {
        error.textContent = "Incorrect password";
        input.value = "";
        input.focus();
      }
    }
  });
}

function showDashboard() {
  document.getElementById("gate").style.display = "none";
  document.getElementById("dashboard").classList.add("visible");
}

// ── Helpers ──

function dotClass(status) {
  const map = {
    done: "dot-done", active: "dot-active", upcoming: "dot-upcoming",
    "In Progress": "dot-inprogress", "Not Started": "dot-notstarted",
    Recurring: "dot-recurring", Complete: "dot-done"
  };
  return map[status] || "dot-upcoming";
}

function calcWeek(startDate, totalWeeks) {
  const start = new Date(startDate);
  const now = new Date();
  const week = Math.ceil(((now - start) / 864e5 + 1) / 7);
  return Math.max(1, Math.min(week, totalWeeks));
}

function calcProgress(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const pct = ((now - start) / (end - start)) * 100;
  return Math.min(Math.max(pct, 0), 100);
}

// ── Rendering ──

function renderDashboard(data) {
  const { engagement, phases, milestones, taskGroups, needs } = data;
  const week = calcWeek(engagement.startDate, engagement.totalWeeks || 12);
  const progress = calcProgress(engagement.startDate, engagement.endDate);

  // Header
  document.getElementById("week-label").textContent = `Week ${week} of ${engagement.totalWeeks || 12}`;
  document.getElementById("updated-label").textContent = `Updated ${engagement.lastUpdated}`;
  document.getElementById("client-name").textContent = engagement.client;
  document.getElementById("engagement-meta").textContent = `${engagement.type} · ${engagement.lead}`;
  document.getElementById("header-logo").innerHTML = logo(36);
  document.getElementById("footer-logo").innerHTML = logo(36);

  // Date range
  document.getElementById("date-range").textContent = engagement.dateRangeLabel || "";

  // Progress
  document.getElementById("progress-fill").style.width = progress + "%";

  // Phases
  document.getElementById("phases-grid").innerHTML = phases.map(p => `
    <div class="phase-card ${p.status === 'active' ? 'active' : ''}">
      <div class="phase-meta">Weeks ${p.weeks} · ${p.dates}</div>
      <div class="phase-name">${p.label}${p.status === 'active' ? '<span class="active-dot"></span>' : ''}</div>
      <div class="phase-desc">${p.description}</div>
    </div>
  `).join("");

  // Milestones
  document.getElementById("milestones-list").innerHTML = milestones.map(m => `
    <div class="milestone-row">
      <span class="dot ${dotClass(m.status)}"></span>
      <span class="milestone-label ${m.status}">${m.label}</span>
      <span class="milestone-date">${m.date}</span>
    </div>
  `).join("");

  // Task groups with tabs
  const tabKeys = Object.keys(taskGroups);
  const tabsEl = document.getElementById("task-tabs");
  const tasksContainer = document.getElementById("tasks-container");

  tabKeys.forEach((key, idx) => {
    const group = taskGroups[key];

    // Tab button
    const btn = document.createElement("button");
    btn.className = `tab-btn${idx === 0 ? " active" : ""}`;
    btn.dataset.tab = key;
    btn.textContent = group.label;
    tabsEl.appendChild(btn);

    // Task panel
    const panel = document.createElement("div");
    panel.id = `tasks-${key}`;
    panel.style.display = idx === 0 ? "block" : "none";

    if (group.sections) {
      // Grouped by sections (like website phases)
      group.sections.forEach(section => {
        let html = `<div style="margin-bottom: 24px;"><div class="phase-group-label">${section.label}</div>`;
        section.tasks.forEach(t => {
          html += `
            <div class="task-row">
              <span class="dot ${dotClass(t.status)}"></span>
              <span class="task-name ${t.status === 'In Progress' ? 'active' : ''}">${t.name}</span>
              <span class="task-due">${t.due}</span>
            </div>`;
        });
        html += `</div>`;
        panel.innerHTML += html;
      });
    } else {
      // Flat list (like retainer)
      group.tasks.forEach((t, i) => {
        panel.innerHTML += `
          <div class="task-row" ${i < group.tasks.length - 1 ? 'style="border-bottom: 1px solid var(--border-light);"' : ''}>
            <span class="dot ${dotClass(t.status)}"></span>
            <span class="task-name ${t.status === 'In Progress' ? 'active' : ''}">${t.name}</span>
            ${t.priority ? `<span class="task-priority ${t.priority.toLowerCase()}">${t.priority}</span>` : ''}
            <span class="task-due">${t.due}</span>
          </div>`;
      });
    }

    tasksContainer.appendChild(panel);
  });

  // Tab switching
  tabsEl.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      tabsEl.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tabKeys.forEach(k => {
        document.getElementById(`tasks-${k}`).style.display = k === btn.dataset.tab ? "block" : "none";
      });
    });
  });

  // Needs
  if (needs && needs.length > 0) {
    const needsSection = document.getElementById("needs-section");
    needsSection.style.display = "block";
    let html = `<div class="needs-header"><span>Item</span><span>When</span><span>Owner</span></div>`;
    needs.forEach(n => {
      html += `
        <div class="needs-row">
          <span>${n.item}</span>
          <span class="when ${n.urgency === 'Now' ? 'urgent' : ''}">${n.urgency}</span>
          <span class="owner">${n.owner}</span>
        </div>`;
    });
    document.getElementById("needs-table").innerHTML = html;
  }

  // Footer client name
  document.getElementById("footer-client").textContent = `Confidential — prepared for ${engagement.client}`;
}
