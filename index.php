<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>Untitled Document</title>
		<link rel="stylesheet" media="screen" href="Assets/Styles/datepicker.css" />
	</head>
	
	<body>
		<p>Date range: 05/09/2011 to 27/09/2013 <input type='hidden' id="datepicker" placeholder="dd/mm/yyyy"> <span id='cal'>Show</span></p>
		<p>No date restrictions <input type='text' id="datepicker2" placeholder="dd/mm/yyyy" value="11/08/2011"></p>
		<script src='Assets/Scripts/Standardizer.js'></script>
		<script src='Assets/Scripts/datepicker.js'></script>
		<script>
			
			datepicker.create({
				element: st.utils.getEl('datepicker'),
				rangeLow: '20110905',
				rangeHigh: '20130927',
				showOn: 'icon',
				icon: st.utils.getEl('cal')
			});
			
			datepicker.create({
				element: st.utils.getEl('datepicker2'),
				showOn: 'both'
			});
		</script>
	</body>
</html>