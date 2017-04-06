var imageUrls = require("./imageUrls");
var d3 = require("d3");

//global dimensions
var globals = {
      margin: {top: 100, right: 70, bottom: 105, left: 75},
      padding: {top: 100, right: 70, bottom: 105, left: 75},
      effective_filter_width: undefined,
      effective_filter_height: undefined,
      width: undefined,
      height: undefined,

      //initialize global variables
      date_granularity: undefined,
      segment_granularity: undefined,
      usage_log: [],
      max_num_tracks: undefined,
      max_num_seq_tracks: undefined,
      legend_panel: undefined,
      legend: undefined,
      legend_rect_size: undefined,
      legend_spacing: undefined,
      legend_expanded: true,
      legend_x: 0,
      legend_y: 0,
      source: undefined,
      source_format: undefined,
      earliest_date: undefined,
      latest_start_date: undefined,
      latest_end_date: undefined,
      categories: undefined, //scale for event types
      selected_categories: [],
      num_categories: undefined,
      max_legend_item_width: 0,
      facets: undefined, //scale for facets (timelines)
      selected_facets: [],
      num_facets: undefined,
      total_num_facets: undefined,
      num_facet_cols: undefined,
      num_facet_rows: undefined,
      segments: undefined, //scale for segments
      present_segments: undefined,
      selected_segments: [],
      num_segments: undefined,
      num_segment_cols: undefined,
      num_segment_rows: undefined,
      buffer: 25,
      time_scale: undefined, // scale for time (years)
      timeline_facets: undefined,
      num_tracks: undefined,
      num_seq_tracks: undefined,
      global_min_start_date: undefined,
      global_max_end_date: undefined,
      max_end_age: undefined,
      max_seq_index: undefined,
      dispatch: d3.dispatch("Emphasize", "remove"),
      filter_result: undefined,
      scales: [
            {"name":"Chronological","icon":imageUrls("s-chron.png"),"hint":"A <span class='rb_hint_scale_highlight'>Chronological</span> scale is useful for showing absolute dates and times, like 2017, or 1999-12-31, or 6:37 PM."},
            {"name":"Relative","icon":imageUrls("s-rel.png"),"hint":"A <span class='rb_hint_scale_highlight'>Relative</span> scale is useful when comparing <span class='rb_hint_layout_highlight'>Faceted</span> timelines with a common baseline at time 'zero'.<br>For example, consider a timeline of person 'A' who lived between 1940 to 2010 and person 'B' who lived between 1720 and 1790. <br>A <span class='rb_hint_scale_highlight'>Relative</span> scale in this case would span from 0 to 70 years."},
            {"name":"Log","icon":imageUrls("s-log.png"),"hint":"A base-10 <span class='rb_hint_scale_highlight'>Logarithmic</span> scale is useful for long-spanning timelines and a skewed distributions of events. <br> This scale is compatible with a <span class='rb_hint_rep_highlight'>Linear</span> representation."},
            {"name":"Sequential","icon":imageUrls("s-seq.png"),"hint":"A <span class='rb_hint_scale_highlight'>Sequential</span> scale is useful for showing simply the order and number of events."},
            {"name":"Collapsed","icon":imageUrls("s-intdur.png"),"hint":"A <span class='rb_hint_scale_highlight'>Collapsed</span> scale is a hybrid between <span class='rb_hint_scale_highlight'>Sequential</span> and <span class='rb_hint_scale_highlight'>Chronological</span>, and is useful for showing uneven distributions of events. <br>It is compatible with a <span class='rb_hint_rep_highlight'>Linear</span> representation and <span class='rb_hint_layout_highlight'>Unified</span> layout. The duration between events is encoded as the length of bars."}],
      layouts: [
            {"name":"Unified","icon":imageUrls("l-uni.png"),"hint":"A <span class='rb_hint_layout_highlight'>Unified</span> layout is a single uninterrupted timeline and is useful when your data contains no facets."},
            {"name":"Faceted","icon":imageUrls("l-fac.png"),"hint":"A <span class='rb_hint_layout_highlight'>Faceted</span> layout is useful when you have multiple timelines to compare."},
            {"name":"Segmented","icon":imageUrls("l-seg.png"),"hint":"A <span class='rb_hint_layout_highlight'>Segmented</span> layout splits a timeline into meaningful segments like centuries or days, depending on the extent of your timeline.<br>It is compatible with a <span class='rb_hint_scale_highlight'>Chronological</span> scale and is useful for showing patterns or differences across segments, such as periodicity."}],
      representations: [
            {"name":"Linear","icon":imageUrls("r-lin.png"),"hint":"A <span class='rb_hint_rep_highlight'>Linear</span> representation is read left-to-right and is the most familiar timeline representation."},
            {"name":"Radial","icon":imageUrls("r-rad.png"),"hint":"A <span class='rb_hint_rep_highlight'>Radial</span> representation is useful for showing cyclical patterns. <br>It has the added benefit of a square aspect ratio."},
            {"name":"Spiral","icon":imageUrls("r-spi.png"),"hint":"A <span class='rb_hint_rep_highlight'>Spiral</span> is a compact and playful way to show a sequence of events. <br>It has a square aspect ratio and is only compatible with a <span class='rb_hint_scale_highlight'>Sequential</span> scale."},
            {"name":"Curve","icon":imageUrls("r-arb.png"),"hint":"A <span class='rb_hint_rep_highlight'>Curve</span> is a playful way to show a sequence of events.<br> It is only compatible with a <span class='rb_hint_scale_highlight'>Sequential</span> scale and a <span class='rb_hint_layout_highlight'>Unified</span> layout.<br>Drag to draw a curve on the canvas; double click the canvas to reset the curve."},
            {"name":"Calendar","icon":imageUrls("r-cal.png"),"hint":"A month-week-day <span class='rb_hint_rep_highlight'>Calendar</span> is a familiar representation that is compatible with a <span class='rb_hint_scale_highlight'>Chronological</span> scale and a <span class='rb_hint_layout_highlight'>Segmented</span> layout. <br>This representation does not currently support timelines spanning decades or longer."},
            {"name":"Grid","icon":imageUrls("r-grid.png"),"hint":"A 10x10 <span class='rb_hint_rep_highlight'>Grid</span> representation is compatible with a <span class='rb_hint_scale_highlight'>Chronological</span> scale and a <span class='rb_hint_layout_highlight'>Segmented</span> layout. <br>This representation is ideal for timelines spanning decades or centuries."}],
      unit_width: 15,
      track_height: 15 * 1.5,
      spiral_padding: 15 * 1.25,
      spiral_dim: 0,
      centre_radius: 50,
      max_item_index: 0,
      filter_type: "Emphasize",
      caption_index: 0,
      image_index: 0,
      active_data: [],
      all_data: [],
      active_event_list: [],
      prev_active_event_list: [],
      all_event_ids: [],
      scenes: [],
      caption_list: [],
      image_list: [],
      annotation_list: [],
      current_scene_index: -1,
      gif_index: 0,
      playback_mode: false,
      filter_set_length: 0,
      leader_line_styles: ['Rectangular', 'Octoline', 'Curved'],
      leader_line_style: 1, // 0=OCTO, 1=RECT, 2=CURVE
      curve: false,
      dirty_curve: false,
      record_width: undefined,
      record_height: undefined,
      reader: new FileReader(),
      timeline_json_data: [],
      gdoc_key: '1x8N7Z9RUrA9Jmc38Rvw1VkHslp8rgV2Ws3h_5iM-I8M',
      gdoc_worksheet: 'dailyroutines',
      timeline_story: {},
      opt_out: false,
      email_address: "",
      formatNumber: d3.format(".0f"),
      range_text: "",
      color_palette: [],
      color_swap_target: 0,
      use_custom_palette: false,
      story_tz_offset: 0,
      serverless: false,
      socket: undefined
}; // Defined in main.js


globals.formatAbbreviation = function(x) {

  "use strict";

  var v = Math.abs(x);
  if (v >= .9995e9) {
    return globals.formatNumber(x / 1e9) + "B";
  }
  else if (v >= .9995e6) {
    return globals.formatNumber(x / 1e6) + "M";
  }
  else if (v>= .9995e3) {
    return globals.formatNumber(x / 1e3) + "k";
  }
  else {
    return globals.formatNumber(x);
  }
}

//function for checking if string is a number
globals.isNumber = function (n) {

  "use strict";

  return !isNaN(parseFloat(n)) && isFinite(n);
};

module.exports = globals;