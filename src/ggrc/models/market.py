# Copyright (C) 2018 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

from ggrc import db
from ggrc.access_control.roleable import Roleable
from ggrc.fulltext.mixin import Indexed
from ggrc.models.comment import Commentable
from ggrc.models.mixins import base
from .mixins import (BusinessObject, LastDeprecatedTimeboxed,
                     CustomAttributable, TestPlanned)
from .object_document import PublicDocumentable
from .object_person import Personable
from .relationship import Relatable
from .track_object_state import HasObjectState


class Market(Roleable, HasObjectState, CustomAttributable, Personable,
             Relatable, LastDeprecatedTimeboxed, PublicDocumentable,
             Commentable, TestPlanned, base.ContextRBAC, BusinessObject,
             Indexed, db.Model):
  __tablename__ = 'markets'
  _aliases = {
      "documents_file": None,
  }
