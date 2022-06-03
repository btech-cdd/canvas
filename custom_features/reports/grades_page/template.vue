<template>
  <div class='btech-modal btech-canvas-report' style='display: inline-block;'>
    <!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
    <div class='btech-modal-content'>
      <div class='btech-modal-content-inner'>
        <span class='btech-close' v-on:click='close()'>&times;</span>
        <h3 style='text-align: center;'>Report</h3>
        <h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>
        <h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that
          column.</h5>
        <div>
          <label>Progress Estimation Method</label>
          <select v-model="progress_method">
            <option value="points_weighted">Points - Weighted (Preferred)</option>
            <option value="points_raw">Points - Raw</option>
            <option value="submissions">Submissions</option>
          </select>
        </div>
        <div>
          <div
            style="
              padding: .25rem .5rem;
              display: grid;
              grid-template-columns: 20% 20% 4.5rem 4.5rem 10rem 7rem 5rem
              font-size: 0.75rem;
              cursor: help;
              user-select: none;
            "
          >
            <div 
              v-for='column in visibleColumns' 
              style="display: inline-block;"
              :key='column.name' 
              :title='column.description'
              @click="sortColumn(column.name)"
            >
              <span><b>{{column.name}}</b></span>
            </div>
          </div>
          <div 
            style="
              padding: .25rem .5rem;
              display: grid;
              grid-template-columns: 20% 20% 4.5rem 4.5rem 10rem 7rem 5rem;
              align-items: center;
              font-size: 0.75rem;
            "
            :style="{
              'background-color': (i % 2) ? 'white' : '#F8F8F8'
            }"
            v-for='student, i in students' 
            :key='student.user_id'
          >
            <!--Name-->
            <div 
              style="display: inline-block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"
            >
              {{student.name}}
            </div>
            <div 
              style="display: inline-block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"
            >
              {{student.section}}
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                class="btech-pill-text" 
                :style="{
                  'background-color': (student.to_date < 60) ? colors.red : (student.to_date < 80 ? colors.yellow : colors.green),
                  'color': colors.white,
                }">
                {{student.to_date}}%
              </span>
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                class="btech-pill-text" 
                :style="{
                  'background-color': (student.final < 60) ? colors.red : (student.final < 80 ? colors.yellow : colors.green),
                  'color': colors.white,
                }">
                {{student.final }}%
              </span>
            </div>
            <div 
              style="display: inline-block"
            >
              <course-progress-bar-ind
                :progress="student[columnNameToCode(progress_method)]"
                :barwidth="9"
                :colors="colors"
              ></course-progress-bar-ind>
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                v-if="student.last_submit !== undefined"
                class="btech-pill-text" 
                :style="{
                  'background-color': (student.last_submit >= 10) ? colors.red : (student.last_submit >= 7 ? colors.yellow : colors.green),
                  'color': colors.white,
                }">
                {{student.last_submit}} days
              </span>
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                class="btech-pill-text" 
                :style="{
                  'background-color': colors.gray,
                  'color': colors.black,
                }">
                {{student.in_course}} days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>