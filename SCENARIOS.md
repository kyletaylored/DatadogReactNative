# Datadog RUM Tracking Scenarios

This document outlines specific scenarios you can run to verify your Datadog RUM integration and see the metrics in action.

## ⏱️ Scenario 1: Component Mount Timing

**Goal**: Verify we can track how long it takes for a specific component (e.g., Product Gallery) to appear after navigation starts.

**Steps**:
1. Launch the app.
2. Navigate to **Demo Examples** -> **E-Commerce Examples** -> **Products List**.
3. Tap on any product to open the **Product Detail** screen.
4. **Observe Console**: Look for `[Datadog] ⏱️ Timing added: product_image_gallery_mounted`.
5. **Datadog Dashboard**:
   - Go to RUM Explorer.
   - Find the View event for `ProductDetail`.
   - Look at the **Timings** tab.
   - You should see `product_image_gallery_mounted` with a duration (e.g., 150ms).

**Interpretation**: A high value here means the user waited a long time to see the image gallery, possibly due to slow JS execution or API latency blocking the render.

## 📦 Scenario 2: Stuck Loading State

**Goal**: Identify sessions where a user tried to load data (e.g., Users List) but abandoned the app because it took too long or failed silently.

**Steps**:
1. Launch the app.
2. Navigate to **Demo Examples** -> **Authentication Examples** -> **Browse Users**.
3. **Before the list loads**, quickly force-quit the app (or navigate back immediately).
4. **Datadog Dashboard**:
   - Filter sessions by `has_pending_loads: true`.
   - You should find this session.
   - Check attributes: `loading_elements: ["FetchUsersList"]`.

**Interpretation**: This tells you exactly *what* the user was waiting for when they left. If this happens often, your API is too slow or your loading UX is frustrating.

## 🐌 Scenario 3: Slow Rendering (Profiler)

**Goal**: Find components that are computationally expensive to render (blocking the UI thread).

**Steps**:
1. Navigate to **Products List**.
2. Scroll rapidly up and down the list.
3. **Datadog Dashboard**:
   - Search for Actions with name `ProductsFlatList_rendered`.
   - Sort by `actual_duration_ms` (descending).
   - Look for values > 16ms (dropped frames).

**Interpretation**: If you see high durations (e.g., 50ms+), your list item components are too complex. Consider using `React.memo` or simplifying the render logic.

## ❌ Scenario 4: Handled Errors

**Goal**: Verify that we capture logic errors even if the app doesn't crash.

**Steps**:
1. Navigate to **Demo Examples** -> **Authentication Examples** -> **Direct Login**.
2. Tap **Test Bad Credentials**.
3. **Datadog Dashboard**:
   - Look for an Action named `AttemptLogin`.
   - Note the attribute `attempt: 1`.
   - Look for a subsequent Error event "Invalid credentials".

## 📝 Custom Timing vs. View Loading Time

| Metric | What it measures | When to use |
|--------|------------------|-------------|
| **View Loading Time** | Time from navigation start -> `addViewLoadingTime(true)` call | General page load performance (e.g., "Screen Ready") |
| **Custom Timing** (`addTiming`) | Time from navigation start -> specific component mount | Granular feature tracking (e.g., "Hero Image Visible", "Buy Button Active") |

Use **Custom Timing** when a screen has multiple "ready" states (e.g., skeleton loads instantly, but chart takes 2s).

