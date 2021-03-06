/*
    Copyright (C) 2018 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import Mixin from './mixin';
import * as issueTrackerUtils from '../../plugins/utils/issue-tracker-utils';
import {
  buildParam,
  batchRequests,
} from '../../plugins/utils/query-api-utils';

export default Mixin('assessmentIssueTracker',
  issueTrackerUtils.issueTrackerStaticFields,
  {
    'after:init': function () {
      this.initIssueTracker().then(() => {
        this.trackAuditUpdates();
      });
    },
    'before:refresh'() {
      issueTrackerUtils.cleanUpWarnings(this);
    },
    'after:refresh'() {
      this.initIssueTracker();
    },
    trackAuditUpdates() {
      let audit = this.attr('audit') && this.attr('audit').reify();
      if (!audit) {
        return;
      }

      audit.reify().bind('updated', (event) => {
        this.attr('audit', event.target);
        this.initIssueTrackerForAssessment();
      });
    },
    initIssueTracker() {
      if (!GGRC.ISSUE_TRACKER_ENABLED) {
        return can.Deferred().reject();
      }

      if (!this.attr('issue_tracker')) {
        this.attr('issue_tracker', new can.Map({}));
      }

      let dfd = can.Deferred();

      this.ensureParentAudit().then((audit) => {
        if (audit) {
          this.attr('audit', audit);
          this.initIssueTrackerForAssessment();
          dfd.resolve();
        } else {
          dfd.reject();
        }
      });
      return dfd;
    },
    ensureParentAudit() {
      const pageInstance = GGRC.page_instance();
      const dfd = new can.Deferred();
      if (this.audit) {
        return dfd.resolve(this.audit);
      }

      if (this.isNew()) {
        if (pageInstance && pageInstance.type === 'Audit') {
          dfd.resolve(pageInstance);
        }
      } else {
        // audit is not page instane if AssessmentTemplate is edited
        // from Global Search results
        const param = buildParam('Audit', {}, {
          type: this.type,
          id: this.id,
        }, ['id', 'title', 'type', 'context', 'issue_tracker']);

        batchRequests(param).then((response) => {
          this.audit = _.get(response, 'Audit.values[0]');
          dfd.resolve(this.audit);
        });
      }

      return dfd;
    },
    /**
     * Initializes Issue Tracker for Assessment and Assessment Template
     */
    initIssueTrackerForAssessment() {
      let auditItr = this.attr('audit.issue_tracker') || {};
      let itrEnabled = this.isNew()
        // turned ON for Assessment & Assessment Template by default
        // for newly created instances
        ? (auditItr && auditItr.enabled)
        // for existing instance, the value from the server will be used
        : false;

      let issueTitle = this.title || '';

      let issueTracker = new can.Map(auditItr).attr({
        title: issueTitle,
        enabled: itrEnabled,
      });

      issueTrackerUtils.initIssueTrackerObject(
        this,
        issueTracker,
        auditItr.enabled
      );
    },
    issueTrackerEnabled() {
      return issueTrackerUtils.isIssueTrackerEnabled(this);
    },
  },
);
