MERGE INTO [sqlcdc].[dbo].[tablestatus]
USING 
    (SELECT 'nodejstest' AS dbname, 'dbo_TestTable1_CT' as tblname ) AS SRC
		ON tablestatus.databasename = SRC.dbname AND
		tablestatus.tablename = SRC.tblname
WHEN MATCHED THEN
    UPDATE SET
        currentLSN = 0
WHEN NOT MATCHED THEN
    INSERT (databasename, tablename, currentLSN)
    VALUES (SRC.dbname, SRC.tblname, 0x000000D4000000960006);
    
select * from [sqlcdc].[dbo].[tablestatus]



