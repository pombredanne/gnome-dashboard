/* 
 * Copyright (C) 2012-2013 Bitergia
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *
 */

var Sonar = {};

(function() {

    var sonar_json = "data/json/eclipse_sonar.json";
    var sonar_metrics = null;

    function displaySonarMetrics(div) {
        html = "";
        $.each(sonar_metrics, function(metric, value) {
            html += metric + ":" + value + " ";
        });
        $("#"+div).html(html);
    }

    function loadSonarMetrics (cb) {
        $.when($.getJSON(sonar_json)
            ).done(function(metrics) {
                sonar_metrics = metrics;
                cb();
        });
    }

    Sonar.displaySonarMetrics = function() {
        var mark = "SonarMetrics";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                displaySonarMetrics(div.id);
            });
        }
    };


    Sonar.build = function() {
        loadSonarMetrics(Sonar.displaySonarMetrics);
    };
})();

Loader.data_ready(function() {
    Sonar.build();
});
