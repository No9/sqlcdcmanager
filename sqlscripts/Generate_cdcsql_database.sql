USE [sqlcdc]
GO
/****** Object:  Table [dbo].[tablestatus]    Script Date: 07/17/2012 03:10:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[tablestatus](
	[databasename] [nvarchar](255) NOT NULL,
	[tablename] [nvarchar](255) NOT NULL,
	[currentLSN] [binary](10) NOT NULL
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
