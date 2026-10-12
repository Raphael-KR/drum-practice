import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const audioAnalysis=sqliteTable('audio_analysis',{
  sha256:text('sha256').notNull(),
  analyzerVersion:integer('analyzer_version').notNull(),
  resultJSON:text('result_json').notNull(),
},table=>[primaryKey({columns:[table.sha256,table.analyzerVersion]})]);
