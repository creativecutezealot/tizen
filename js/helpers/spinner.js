/**
 * Spinner
 */
window.showSpinner = function() {
	$('#app-loading-spinner').show();
	$('#app-overlay').show();
};

window.hideSpinner = function() {
	$('#app-loading-spinner').hide();

	if ($('#app-overlay').css('display') !== 'none') {
		$('#app-overlay').fadeOut(250);
	}
};

window.showNetworkText = function(){
	$(".network-status-text-container").show();
};

window.hideNetworkText = function(){
	$(".network-status-text-container").hide();
};