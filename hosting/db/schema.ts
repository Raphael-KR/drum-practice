import {sqliteTable,text,integer,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const audioAnalysis=sqliteTable('audio_analysis',{
  sha256:text('sha256').notNull(),
  analyzerVersion:integer('analyzer_version').notNull(),
  resultJSON:text('result_json').notNull(),
},table=>[primaryKey({columns:[table.sha256,table.analyzerVersion]})]);

export const analysisPending=sqliteTable('audio_analysis_pending',{
  sha256:text('sha256').notNull(),analyzerVersion:integer('analyzer_version').notNull(),
  resultJSON:text('result_json').notNull(),payloadBytes:integer('payload_bytes').notNull(),createdAt:integer('created_at').notNull(),
},table=>[primaryKey({columns:[table.sha256,table.analyzerVersion]}),index('pending_created_at').on(table.createdAt)]);
export const analysisLimits=sqliteTable('audio_analysis_limits',{
  bucket:text('bucket').primaryKey().notNull(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull(),
},table=>[index('limits_expiry').on(table.expiresAt)]);
