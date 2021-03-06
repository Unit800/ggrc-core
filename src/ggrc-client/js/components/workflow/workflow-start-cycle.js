/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import {generateCycle} from '../../plugins/utils/workflow-utils';

export default can.Component.extend({
  tag: 'workflow-start-cycle',
  content: '<content/>',
  events: {
    click: function () {
      let workflow = GGRC.page_instance();
      generateCycle(workflow)
        .then(function () {
          return workflow.refresh_all('task_groups', 'task_group_tasks');
        });
    },
  },
});
