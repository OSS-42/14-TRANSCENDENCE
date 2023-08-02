#------------------------------------------------------------------------------#
#								   GENERAL									   #
#------------------------------------------------------------------------------#

PROJECT = transcendence

RM = rm -rf
DC = docker compose

IMAGES = $(shell docker images -q)
CONTAINERS = $(shell docker ps -aq)
NETWORK = srcs_inception
VOLUMES = $(shell docker volume ls --quiet)

RM_IMAGES = docker image rm $(IMAGES)
RM_CONT = docker rm -f $(CONTAINERS)
RM_VOL = docker volume rm -f $(VOLUMES)
RM_NET = docker network rm $(NETWORK)

#------------------------------------------------------------------------------#
#									 NEEDED									   #
#------------------------------------------------------------------------------#

#------------------------------------------------------------------------------#
#									SOURCES									   #
#------------------------------------------------------------------------------#

SRCS =	docker-compose.yaml
LOG = docker_logs.log
BLOG = docker_build_logs.log

#------------------------------------------------------------------------------#
#									 RULES									   #
#------------------------------------------------------------------------------#
#rajouter -f $(SRCS) si docker-compose.yaml pas dans le meme répertoire que le makefile

all:	transcendence
	@echo "$(LGREEN)Logs available. You can follow the containers readiness with command "make logs"$(NC)"
	@echo "$(LMAGENTA)All containers are not ready when you see this message. Check readiness status with command "make logs"$(NC)"

transcendence:	$(SRCS)
	@$(call creating, $(DC) up --build --remove-orphans -d) &> $(BLOG)
	@echo "$(LGREEN)Docker Containers, Volumes and Network Created.$(NC)"

logs:
	@$(DC) logs --follow > $(LOG)

clean:
	@$(call cleaning, $(DC) stop) &> $(BLOG)
	@echo "$(LGREEN)Docker Containers Stopped.$(NC)"

fclean:	clean
	@$(call fcleaning, $(DC) down) &> $(BLOG)
	@echo "$(LGREEN)Docker Containers and Network Removed.$(NC)"
	@if [ -n "$(IMAGES)" ]; then $(RM_IMAGES); echo "$(LGREEN)Docker Images Removed.$(NC)"; fi
	@if [ -n "$(VOLUMES)" ]; then $(RM_VOL); echo "$(LGREEN)Docker Volumes Removed.$(NC)"; fi
	@$(RM) *.log
	@echo "$(LGREEN)Logs files removed.$(NC)"

re:	fclean all

.PHONY: all clean fclean re logs transcendence

#------------------------------------------------------------------------------#
#								  MAKEUP RULES								   #
#------------------------------------------------------------------------------#

#----------------------------------- COLORS -----------------------------------#

LRED = \033[91m
RED = \033[91m
LGREEN = \033[92m
LYELLOW = \033[93m
LMAGENTA = \033[95m
LCYAN = \033[96m
NC = \033[0;39m

#----------------------------------- TEXTES -----------------------------------#

OK_STRING = "[OK]"
ERROR_STRING = "[ERROR]"
WARN_STRING = "[WARNING]"
COMP_STRING = "Generating"
CLEAN_STRING = "Cleaning"
CREAT_STRING = "Creating"

#----------------------------------- DEFINE -----------------------------------#

define cleaning
printf "%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) STOPPING Containers$(NC)\n"; \
$(1) 2> $@.log; \
RESULT=$$?; \
	if [ $$RESULT -ne 0 ]; then \
		printf "%-60b%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) OBJECT Files" "💥$(NC)\n"; \
	elif [ -s $@.log ]; then \
		printf "%-60b%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) OBJECT Files" "⚠️$(NC)\n"; \
	else \
		printf "%-60b%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) OBJECT Files" "✅$(NC)\n"; \
	fi; \
	cat $@.log; \
	rm -f $@.log; \
	exit $$RESULT
endef

define fcleaning
printf "%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) REMOVING Containers, Network, Images and Volumes$(NC)\n"; \
$(1) 2> $@.log; \
RESULT=$$?; \
	if [ $$RESULT -ne 0 ]; then \
		printf "%-60b%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) PROJECT Executable Files" "💥$(NC)\n"; \
	elif [ -s $@.log ]; then \
		printf "%-60b%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) PROJECT Executable Files" "⚠️$(NC)\n"; \
	else \
		printf "%-60b%b" "$(LCYAN)$(CLEAN_STRING)$(LMAGENTA) PROJECT Executable Files" "✅$(NC)\n"; \
	fi; \
	cat $@.log; \
	rm -f $@.log; \
	exit $$RESULT
endef

define creating
printf "%b" "$(LCYAN)$(CREAT_STRING)$(LMAGENTA) $(@F)$(NC)\n"; \
$(1) 2> $@.log; \
RESULT=$$?; \
	if [ $$RESULT -ne 0 ]; then \
		printf "%-60b%b" "$(LCYAN)$(CREAT_STRING)$(LMAGENTA) $(@F)" "💥$(NC)\n"; \
	elif [ -s $@.log ]; then \
		printf "%-60b%b" "$(LCYAN)$(CREAT_STRING)$(LMAGENTA) $(@F)" "⚠️$(NC)\n"; \
	else \
		printf "%-60b%b" "$(LCYAN)$(CREAT_STRING)$(LMAGENTA) $(@F)" "✅$(NC)\n"; \
	fi; \
	cat $@.log; \
	rm -f $@.log; \
	exit $$RESULT
endef
